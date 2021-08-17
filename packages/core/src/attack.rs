mod attack_power;
mod damage;
mod fit_gun_bonus;
mod fleet_factor;
mod hit_rate;
pub mod shelling;
mod special_enemy_mods;

use crate::{
    attack::{
        shelling::{ShellingAccuracyParams, ShellingHitRateParams, ShellingPowerParams},
        special_enemy_mods::special_enemy_modifiers,
    },
    org::Org,
    ship::Ship,
    types::{
        AirState, DamageState, DayCutin, DayCutinDef, Engagement, Formation, MasterConstants,
        MoraleState, NormalFormationDef, Role, ShipType, Side,
    },
};
use shelling::ShellingParams;

pub struct AttackShipContext<'a> {
    ship: &'a Ship,
    org: &'a Org,
    formation: Formation,
    damage_state: DamageState,
    morale_state: MoraleState,
}

impl<'a> AttackShipContext<'a> {
    fn side(&self) -> Side {
        self.org.side
    }

    fn position(&self) -> (Role, usize, usize) {
        let (role, index) = self
            .org
            .main_and_escort_ships()
            .find(|(_, _, ship)| ship.id == self.ship.id)
            .map_or((Role::Main, 0), |(role, index, _)| (role, index));

        let fleet_size = if role.is_main() {
            self.org.main().size()
        } else {
            self.org.escort().size()
        };

        (role, index, fleet_size)
    }
}

pub struct AttackContext<'a> {
    master_constants: &'a MasterConstants,

    air_state: AirState,
    engagement: Engagement,
    cutin: Option<DayCutin>,

    attacker: AttackShipContext<'a>,
    target: AttackShipContext<'a>,
}

impl<'a> AttackContext<'a> {
    fn cutin_def(&self) -> Option<&DayCutinDef> {
        self.master_constants.get_day_cutin_def(self.cutin?)
    }

    fn get_target_formation_def(&self) -> Option<&NormalFormationDef> {
        let (_, ship_index, fleet_size) = self.target.position();

        self.master_constants
            .get_formation_mod(self.attacker.formation, ship_index, fleet_size)
    }

    fn shelling_params(&self) -> ShellingParams {
        let is_day = true;

        let (player_org_type, enemy_org_type) = if self.attacker.side().is_player() {
            (self.attacker.org.org_type, self.target.org.org_type)
        } else {
            (self.target.org.org_type, self.attacker.org.org_type)
        };

        let fleet_power_factor = fleet_factor::find_shelling_power_factor(
            player_org_type,
            enemy_org_type,
            self.attacker.side(),
            self.attacker.position().0,
        );

        let ship = self.attacker.ship;
        let (role, ship_index, fleet_size) = self.attacker.position();

        let ap_shell_mods = matches!(
            self.target.ship.ship_type,
            ShipType::CA
                | ShipType::CAV
                | ShipType::FBB
                | ShipType::BB
                | ShipType::BBV
                | ShipType::CV
                | ShipType::XBB
                | ShipType::CVB
        )
        .then(|| ship.get_ap_shell_modifiers());

        let formation_def = self.master_constants.get_formation_mod(
            self.attacker.formation,
            ship_index,
            fleet_size,
        );

        let engagement_mod = self.engagement.modifier();
        let cutin_def = self.cutin_def();

        let special_enemy_mods = special_enemy_modifiers(ship, self.target.ship, is_day);

        let power_params_base = ShellingPowerParams {
            firepower: ship.firepower().map(|v| v as f64),
            ibonus: ship.gears.sum_by(|gear| gear.ibonuses.shelling_power),
            fleet_factor: fleet_power_factor as f64,
            damage_mod: self.attacker.damage_state.common_power_mod(),
            cruiser_fit_bonus: ship.cruiser_fit_bonus(),
            ap_shell_mod: ap_shell_mods.map(|mods| mods.0),
            formation_mod: formation_def.and_then(|def| def.shelling.power_mod),
            engagement_mod,
            cutin_mod: cutin_def.and_then(|def| def.power_mod),

            special_enemy_mods,

            air_power: None,
            air_power_ebonus: None,
            proficiency_critical_mod: None,
        };

        let equipment_accuracy =
            (ship.gears.sum_by(|gear| gear.accuracy) + ship.ebonuses.accuracy) as f64;

        let accuracy_params = ShellingAccuracyParams {
            fleet_factor: fleet_factor::find_shelling_accuracy_factor(
                self.attacker.org.org_type,
                self.attacker.side(),
                role,
            ) as f64,
            basic_accuracy_term: ship.basic_accuracy_term(),
            equipment_accuracy,
            ibonus: ship.gears.sum_by(|gear| gear.ibonuses.shelling_accuracy),
            fit_gun_bonus: fit_gun_bonus::fit_gun_bonus(ship, !is_day),
            morale_mod: self.attacker.morale_state.common_accuracy_mod(),
            formation_mod: formation_def.and_then(|def| def.shelling.accuracy_mod),
            ap_shell_mod: ap_shell_mods.map(|mods| mods.1),
            cutin_mod: cutin_def.and_then(|def| def.accuracy_mod),
        };

        let hit_rate_params_base = {
            let target_formation_def = self.get_target_formation_def();
            let target_formation_mod = target_formation_def
                .and_then(|def| def.shelling.evasion_mod)
                .unwrap_or(1.0);

            let evasion_term = self.target.ship.evasion_term(target_formation_mod, None);

            ShellingHitRateParams {
                morale_mod: self.target.morale_state.evasion_mod(),
                evasion_term,
                critical_percent_bonus: 0.0,
                hit_percent_bonus: 0.0,
            }
        };

        if ship.is_carrier_like() {
            let is_anti_land = false;

            let air_power = Some(ship.shelling_air_power(is_anti_land) as f64);
            let air_power_ebonus = ship.ebonuses.airstrike_power;
            let proficiency_mods = ship.proficiency_modifiers(self.cutin);

            let power_params = ShellingPowerParams {
                air_power,
                air_power_ebonus: Some(air_power_ebonus as f64),
                proficiency_critical_mod: Some(proficiency_mods.critical_power_mod),

                ..power_params_base
            };

            let hit_rate_params = ShellingHitRateParams {
                hit_percent_bonus: proficiency_mods.hit_percent_bonus,
                critical_percent_bonus: proficiency_mods.critical_percent_bonus,
                ..hit_rate_params_base
            };

            ShellingParams {
                power: power_params,
                accuracy: accuracy_params,
                hit_rate: hit_rate_params,
            }
        } else {
            ShellingParams {
                power: power_params_base,
                accuracy: accuracy_params,
                hit_rate: hit_rate_params_base,
            }
        }
    }

    pub fn analyze_shelling(&self) {
        let params = self.shelling_params();
        let damage_distribution = params.damage_distribution();
    }
}
