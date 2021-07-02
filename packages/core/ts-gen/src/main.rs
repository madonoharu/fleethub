use ts_rs::TS;

const PATH: &'static str = "pkg/types.d.ts";

macro_rules! gen_types {
    ($($p: path),*) => {{
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

    let buffer = gen_types!(
        core::gear::GearState,
        core::ship::ShipState,
        core::fleet::FleetState,
        core::air_squadron::AirSquadronState,
        core::org::OrgType,
        core::org::OrgState,
        core::attack::ShellingAttackType,
        core::org::ShellingAttackShipAnalysis,
        core::org::ShellingAttackOrgAnalysis
    );

    let buffer =
        ts_rs::export::fmt_ts(path, &buffer, &fmt_config).expect("could not format output");

    std::fs::write(path, buffer).expect("could not write file");
}
