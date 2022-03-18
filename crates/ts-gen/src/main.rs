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

    use fleethub_core::*;

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
        types::AirWaveType,
        types::AirState,
        types::AirStateRank,
        types::Engagement,
        types::Formation,
        types::FormationWarfareDef,
        types::FormationDef,
        types::NestedFormationDef,
        types::DayCutin,
        types::NightAttackType,
        types::NightCutin,
        types::NightSpecialAttack,
        types::FleetCutin,
        types::AntiAirCutinDef,
        types::NightCutinDef,
        types::DayCutinDef,
        types::ContactRank,
        types::Side,
        types::Role,
        types::OrgType,
        types::AirSquadronMode,
        types::GearState,
        types::ShipState,
        types::FleetState,
        types::FleetType,
        types::AirSquadronState,
        types::OrgState,
        types::SpeedGroup,
        types::GearTypes,
        types::BattleConfig,
        types::ShipMeta,
        types::FleetMeta,
        types::CompMeta,

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
        types::MasterData,

        attack::AttackPowerModifier,
        attack::SpecialEnemyModifiers,
        attack::CustomModifiers,
        attack::AttackPowerParams,
        attack::AttackPower,
        attack::HitRateParams,
        attack::HitRate,
        attack::WarfareShipEnvironment,
        attack::WarfareContext,
        attack::NightSituation,
        attack::ShellingAttackType,
        attack::AswAttackType,
        attack::DayBattleAttackType,
        attack::NightBattleAttackType,
        analyzer::DayCutinRateInfo,
        analyzer::ShipDayCutinRateInfo,
        analyzer::FleetDayCutinRateInfo,
        analyzer::CompDayCutinRateInfo,
        analyzer::ShipAntiAirInfo,
        analyzer::CompAntiAirInfo,
        analyzer::NightCutinRateInfo,
        analyzer::ShipNightCutinRateInfo,
        analyzer::NightContactChance,
        analyzer::FleetNightCutinRateInfo,
        analyzer::AirstrikeContactChance,
        analyzer::CompContactChanceInfo,
        analyzer::AttackStats,
        analyzer::AttackInfoItem<()>,
        analyzer::AttackInfo<(),()>,
        analyzer::DamageInfo,
        analyzer::WarfareAnalyzerShipEnvironment,
        analyzer::WarfareAnalyzerContext,
        analyzer::WarfareInfo,
        analyzer::FleetCutinInfoItem,
        analyzer::FleetCutinInfo,
        analyzer::FleetCutinAnalysis,

        simulator::ShellingSupportSimulatorParams,
        simulator::SimulatorResultItem,
        simulator::SimulatorResult,

        types::ShipKey,
    );

    std::fs::write(path, buffer).expect("could not write file");
}
