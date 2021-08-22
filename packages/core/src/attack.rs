use serde::Serialize;
use ts_rs::TS;

use crate::{
    attack::{
        shelling::{ShellingAccuracyParams, ShellingHitRateParams, ShellingPowerParams},
        special_enemy_mods::special_enemy_modifiers,
    },
    ship::Ship,
    types::{
        AirState, DamageState, DayCutin, DayCutinDef, Engagement, Formation, MasterConstants,
        MoraleState, NormalFormationDef, OrgType, Role, ShipType, Side, SpecialEnemyType,
    },
};

mod attack_power;
mod damage;
mod fit_gun_bonus;
mod fleet_factor;
mod hit_rate;
pub mod shelling;
mod special_enemy_mods;

pub use attack_power::*;
use shelling::ShellingParams;

#[derive(Debug, Clone)]
pub struct ShipAttackContext<'a> {
    pub ship: &'a Ship,
    pub org_type: OrgType,
    pub side: Side,
    pub role: Role,
    pub index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub damage_state: DamageState,
    pub morale_state: MoraleState,
}

impl<'a> ShipAttackContext<'a> {
    pub fn new(ship: &'a Ship) -> Self {
        Self {
            ship,
            org_type: Default::default(),
            side: Default::default(),
            role: Default::default(),
            index: 0,
            fleet_len: 6,
            formation: Default::default(),
            damage_state: Default::default(),
            morale_state: Default::default(),
        }
    }
}

pub struct AttackContext<'a> {
    pub master_constants: &'a MasterConstants,
    pub attacker: ShipAttackContext<'a>,
    pub target: ShipAttackContext<'a>,
    pub target_special_enemy_type: SpecialEnemyType,
    pub air_state: AirState,
    pub engagement: Engagement,
    pub cutin: Option<DayCutin>,
}

impl<'a> AttackContext<'a> {
    fn cutin_def(&self) -> Option<&DayCutinDef> {
        self.master_constants.get_day_cutin_def(self.cutin?)
    }

    fn get_target_formation_def(&self) -> Option<&NormalFormationDef> {
        self.master_constants.get_formation_mod(
            self.target.formation,
            self.target.index,
            self.target.fleet_len,
        )
    }

    pub fn shelling_params(&self) -> ShellingParams {
        let is_day = true;

        let fleet_power_factor = fleet_factor::find_shelling_power_factor(
            self.attacker.org_type,
            self.target.org_type,
            self.attacker.role,
        );

        let ship = self.attacker.ship;

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
            self.attacker.index,
            self.attacker.fleet_len,
        );

        let engagement_mod = self.engagement.modifier();
        let cutin_def = self.cutin_def();

        let special_enemy_mods =
            special_enemy_modifiers(ship, self.target.ship.special_enemy_type(), is_day);

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
                self.attacker.org_type,
                self.attacker.role,
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
}
