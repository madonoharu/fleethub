use ts_rs::TS;

macro_rules! gen_types {
    ($($p: path),* $(,)?) => {{
        let mut buffer = String::new();

        $(
          buffer.push_str("export ");
          buffer.push_str(&<$p>::decl());
          buffer.push_str("\n\n");
        )*

        buffer
    }}
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let path = std::path::Path::new(&args[2]);
    let fmt_config = ts_rs::export::FmtCfg::new().deno().build();
    use fh_core::*;

    let buffer = gen_types!(
        types::GearType,
        types::GearAttr,
        types::GearCategory,
        types::ShipType,
        types::ShipClass,
        types::ShipAttr,
        types::ShipCategory,
        types::SpecialEnemyType,
        types::DamageState,
        types::MoraleState,
        types::SingleFormation,
        types::CombinedFormation,
        types::AirState,
        types::Engagement,
        types::Formation,
        types::FormationWarfareDef,
        types::NormalFormationDef,
        types::FormationDef,
        types::DayCutin,
        types::DayCutinDef,
        types::NightCutin,
        types::NightCutinDef,
        types::AntiAirCutinDef,
        types::ContactRank,
        types::Side,
        types::Role,
        types::OrgType,
        types::AirSquadronMode,
        types::GearState,
        types::ShipState,
        types::FleetState,
        types::AirSquadronState,
        types::OrgState,
        types::SpeedGroup,
        types::GearTypes,
        types::MasterGear,
        types::MasterVariantDef,
        types::MasterAttrRule,
        types::StatInterval,
        types::MasterShip,
        types::MasterIBonusRule,
        types::MasterIBonuses,
        types::EquipStype,
        types::MstEquipShip,
        types::MstEquipExslotShip,
        types::MasterEquippable,
        types::MasterConstants,
        types::MasterData,
        attack::AttackPowerModifiers,
        attack::AttackPowerParams,
        attack::AttackPower,
        attack::HitRateParams,
        attack::HitRate,
        attack::WarfareShipEnvironment,
        attack::WarfareContext,
        attack::NightSituation,
        attack::ShellingAttackType,
        attack::NightAttackType,
        attack::AswAttackType,
        attack::DayBattleAttackType,
        attack::NightBattleAttackType,
        analyzer::DayCutinRateInfo,
        analyzer::ShipDayCutinRateInfo,
        analyzer::FleetDayCutinRateInfo,
        analyzer::OrgDayCutinRateInfo,
        analyzer::ShipAntiAirInfo,
        analyzer::OrgAntiAirInfo,
        analyzer::NightCutinRateInfo,
        analyzer::ShipNightCutinRateInfo,
        analyzer::NightContactChance,
        analyzer::FleetNightCutinRateInfo,
        analyzer::AirstrikeContactChance,
        analyzer::OrgContactChanceInfo,
        analyzer::OrgAirstrikeInfo,
        analyzer::AttackStats,
        analyzer::AttackInfoItem<()>,
        analyzer::AttackInfo<(),()>,
        analyzer::DamageInfo,
        analyzer::WarfareAnalyzerShipEnvironment,
        analyzer::WarfareAnalyzerContext,
        analyzer::WarfareInfo
    );

    let buffer =
        ts_rs::export::fmt_ts(path, &buffer, &fmt_config).expect("could not format output");

    std::fs::write(path, buffer).expect("could not write file");
}
