use crate::{
    plane::{Plane, PlaneImpl},
    types::{DayCutin, GearType, ProficiencyModifiers},
};

use super::Ship;

impl Ship {
    /// 熟練度補正の仮定式
    ///
    /// https://docs.google.com/spreadsheets/d/1N0fzRwOUUhCXnHWe1hKHm_Hgt2kxRm3ybZhVjh9gk0E
    pub fn proficiency_modifiers(&self, cutin: Option<DayCutin>) -> ProficiencyModifiers {
        let planes = self
            .planes()
            .filter(|plane| {
                plane.remains()
                    && matches!(
                        plane.gear_type,
                        GearType::CbDiveBomber
                            | GearType::CbTorpedoBomber
                            | GearType::SeaplaneBomber
                            | GearType::LargeFlyingBoat
                            | GearType::JetFighterBomber
                            | GearType::JetTorpedoBomber
                    )
            })
            .collect::<Vec<_>>();

        let hit_percentage_bonus = {
            let (_, a, b) = get_average_exp_modifiers(&planes);
            a + b
        };

        if let Some(cutin) = cutin {
            let (critical_power_mod, critical_percentage_bonus) =
                self.carrier_cutin_proficiency_modifiers(cutin);

            return ProficiencyModifiers {
                hit_percentage_bonus,
                critical_power_mod,
                critical_percentage_bonus,
            };
        }

        let critical_power_mod = 1.0
            + planes
                .iter()
                .map(|plane| {
                    let num4 = get_num4(plane.exp);
                    let m = (plane.exp as f64).sqrt().floor() + num4;
                    if plane.index == 0 {
                        m / 100.0
                    } else {
                        m / 200.0
                    }
                })
                .sum::<f64>()
            + 
            // 隼の熟練度補正よくわからない
            self
                .planes()
                .filter(|plane| plane.remains() && plane.is_hayabusa_20th_squadron())
                .map(|plane| {
                    let num4 = get_num4(plane.exp);
                    let m = ((plane.exp as f64).sqrt().floor() + num4 - 4.0).max(0.0);
                    if plane.index == 0 {
                        m / 100.0
                    } else {
                        m / 200.0
                    }
                })
                .sum::<f64>();

        let critical_percentage_bonus = planes
            .iter()
            .map(|plane| {
                let num4 = get_num4(plane.exp);
                let multiplier = if plane.index == 0 { 0.8 } else { 0.6 };
                (num4 * multiplier).floor()
            })
            .sum::<f64>();

        ProficiencyModifiers {
            hit_percentage_bonus,
            critical_power_mod,
            critical_percentage_bonus,
        }
    }

    /// 戦爆連合熟練度補正の仮定式
    ///
    /// `critical_percentage_bonus` は最大21%程度？
    ///
    /// https://twitter.com/MorimotoKou/status/1046257562230771712
    /// https://docs.google.com/spreadsheets/d/1i5jTixnOVjqrwZvF_4Uqf3L9ObHhS7dFqG8KiE5awkY
    /// https://twitter.com/kankenRJ/status/995827605801709568
    fn carrier_cutin_proficiency_modifiers(&self, cutin: DayCutin) -> (f64, f64) {
        let captain_plane = self.planes().filter(|plane| plane.remains()).find(|plane| {
            if plane.index == 0 {
                match cutin {
                    DayCutin::FBA => matches!(
                        plane.gear_type,
                        GearType::CbFighter | GearType::CbDiveBomber | GearType::CbTorpedoBomber
                    ),
                    DayCutin::BBA | DayCutin::BA => matches!(
                        plane.gear_type,
                        GearType::CbDiveBomber | GearType::CbTorpedoBomber
                    ),
                    _ => false,
                }
            } else {
                false
            }
        });

        let captain_exp = captain_plane.as_ref().map(|plane| plane.exp);

        // https://twitter.com/KennethWWKK/status/1028631784542486530
        // 噴式戦闘爆撃機は平均熟練度補正に影響する
        let bombers_with_jet = self
            .planes()
            .filter(|plane| {
                plane.remains()
                    && matches!(
                        plane.gear_type,
                        GearType::CbDiveBomber
                            | GearType::CbTorpedoBomber
                            | GearType::JetFighterBomber
                            | GearType::JetTorpedoBomber
                    )
            })
            .collect::<Vec<_>>();

        let average_exp = calc_average_exp(&bombers_with_jet);

        let critical_power_mod = match captain_exp {
            Some(captain_exp) => {
                if captain_exp >= 100 {
                    // https://docs.google.com/spreadsheets/d/1mlOwRPK8korbH37hU7VCf_9fPp6_ugRalBydS2CyNtE
                    1.0 + 0.003 * captain_exp as f64 + 0.001 * average_exp - 0.23
                } else {
                    // https://docs.google.com/spreadsheets/d/18Bl4xHGPbzutLp1P8MTW2px0272--XvkbQ0XB3QZwZk
                    1.0 + 0.024 + 0.0006 * captain_exp as f64
                }
            }
            None => {
                // https://docs.google.com/spreadsheets/d/1k1zhWfgrM48Xn6140aW7Bdqqu8U0k1wBtTe8iHAnnSM
                if average_exp >= 119.0 {
                    1.066 + 0.04
                } else if average_exp >= 107.0 {
                    1.066 + 0.03
                } else if average_exp >= 50.0 {
                    1.0 + (average_exp - 50.0) / 1000.0
                } else {
                    1.0
                }
            }
        };

        let critical_percentage_bonus = {
            let captain_bonus = captain_plane
                .map(|plane| 0.8 * get_num4(plane.exp))
                .unwrap_or_default();

            let bombers = self
                .planes()
                .filter(|plane| {
                    plane.remains()
                        && matches!(
                            plane.gear_type,
                            GearType::CbDiveBomber | GearType::CbTorpedoBomber
                        )
                })
                .collect::<Vec<_>>();

            let average_exp = calc_average_exp(&bombers);
            let num4 = get_num4(average_exp as u8);

            captain_bonus + (0.1 * average_exp).sqrt().floor() + num4
        };

        (critical_power_mod, critical_percentage_bonus)
    }
}

fn get_average_exp_modifiers(planes: &Vec<Plane>) -> (f64, f64, f64) {
    let len = planes.len() as f64;

    if len == 0.0 {
        return Default::default();
    }

    let total_exp = planes.iter().map(|plane| plane.exp as f64).sum::<f64>();
    let average_exp = total_exp / len;

    let a = (0.1 * average_exp).sqrt().floor();

    let b = match average_exp as u8 {
        0..=24 => 0.0,
        25..=39 => 1.0,
        40..=54 => 2.0,
        55..=69 => 3.0,
        70..=79 => 4.0,
        80..=99 => 6.0,
        _ => 9.0,
    };

    (average_exp, a, b)
}

fn calc_average_exp(planes: &Vec<Plane>) -> f64 {
    let len = planes.len() as f64;

    if len > 0.0 {
        let total = planes.iter().map(|plane| plane.exp as f64).sum::<f64>();
        total / len
    } else {
        0.0
    }
}

fn get_num4(exp: u8) -> f64 {
    match exp {
        0..=9 => 0.0,
        10..=24 => 1.0,
        25..=39 => 2.0,
        40..=54 => 3.0,
        55..=69 => 4.0,
        70..=79 => 5.0,
        80..=99 => 7.0,
        _ => 10.0,
    }
}
