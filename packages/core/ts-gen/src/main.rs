use ts_rs::TS;

const PATH: &'static str = "bindings.d.ts";

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
    let path = std::path::Path::new(PATH);
    let fmt_config = ts_rs::export::FmtCfg::new().deno().build();

    use core::*;

    let buffer = gen_types!(
        types::SingleFormation,
        types::CombinedFormation,
        types::Formation,
        types::FormationAttackModifiers,
        types::NormalFormationDef,
        types::FormationDef,
        types::DayCutin,
        types::DayCutinDef,
        types::NightCutin,
        types::NightCutinDef,
        types::AntiAirCutinDef,
        types::OrgType,
        types::GearType,
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
        org::DayCutinRateAnalysis,
        org::ShipDayCutinRateAnalysis,
        org::FleetDayCutinRateAnalysis,
        org::OrgDayCutinRateAnalysis,
        anti_air::ShipAntiAirAnalysis,
        anti_air::OrgAntiAirAnalysis,
    );

    let buffer =
        ts_rs::export::fmt_ts(path, &buffer, &fmt_config).expect("could not format output");

    std::fs::write(path, buffer).expect("could not write file");
}
