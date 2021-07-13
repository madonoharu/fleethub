use ts_rs::TS;

const PATH: &'static str = "pkg/types.d.ts";

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
        types::DayCutin,
        types::SingleFormation,
        types::CombinedFormation,
        types::Formation,
        types::GearCategory,
        gear::GearState,
        ship::ShipState,
        fleet::FleetState,
        air_squadron::AirSquadronState,
        org::OrgType,
        org::OrgState,
        org::DayCutinRateAnalysis,
        org::ShipDayCutinRateAnalysis,
        org::FleetDayCutinRateAnalysis,
        org::OrgDayCutinRateAnalysis,
        anti_air::ShipAntiAirAnalysis,
        anti_air::OrgAntiAirAnalysis,
        master::FormationAttackModifiers,
        master::FormationAttackDef,
        master::FormationDef,
        master::MasterData,
        master::MasterGear,
        master::MasterShip,
        master::StatInterval,
    );

    let buffer =
        ts_rs::export::fmt_ts(path, &buffer, &fmt_config).expect("could not format output");

    std::fs::write(path, buffer).expect("could not write file");
}
