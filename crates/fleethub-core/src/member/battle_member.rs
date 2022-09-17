use std::{
    ops::{Deref, DerefMut},
    str::FromStr,
};

use crate::{
    ship::Ship,
    types::{Formation, ShipAttr, ShipConditions, ShipPosition},
};

use super::comp_member::CompMember;

pub struct BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    pub ship: CompMember<S>,
    pub formation: Formation,
    pub amagiri_index: Option<usize>,
}

impl<S> Deref for BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    type Target = CompMember<S>;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.ship
    }
}

impl<S> DerefMut for BattleMember<S>
where
    S: DerefMut<Target = Ship>,
{
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.ship
    }
}

impl<S> BattleMember<S>
where
    S: Deref<Target = Ship>,
{
    pub fn new(
        ship: S,
        position: ShipPosition,
        formation: Formation,
        amagiri_index: Option<usize>,
    ) -> Self {
        Self {
            ship: CompMember::new(ship, position),
            formation,
            amagiri_index,
        }
    }

    pub fn conditions(&self) -> ShipConditions {
        ShipConditions {
            position: self.position,
            formation: self.formation,
            amagiri_index: self.amagiri_index,
        }
    }

    pub fn as_ref(&self) -> BattleMember<&S::Target> {
        BattleMember {
            ship: self.ship.as_ref(),
            formation: self.formation,
            amagiri_index: self.amagiri_index,
        }
    }

    pub fn as_mut(&mut self) -> BattleMember<&mut S::Target>
    where
        S: DerefMut<Target = Ship>,
    {
        let formation = self.formation;
        BattleMember {
            ship: self.ship.as_mut(),
            formation,
            amagiri_index: self.amagiri_index,
        }
    }

    pub fn ns(&self) -> impl fasteval::EvalNamespace + '_ {
        use fasteval::bool_to_f64;
        |name: &str, args: Vec<f64>| -> Option<f64> {
            let result = match name {
                "ship_id" => self.ship_id.into(),
                "ship_type" => self.stype().into(),
                "ship_class" => self.ctype.into(),
                "nationality" => self.master.nationality.into(),
                "sort_id" => self.master.sort_id.into(),
                "speed" => self.master.speed.into(),

                "ship_id_in" => bool_to_f64!(args.contains(&self.ship_id.into())),
                "ship_type_in" => bool_to_f64!(args.contains(&self.stype().into())),
                "ship_class_in" => bool_to_f64!(args.contains(&(self.ctype.into()))),
                "nationality_in" => bool_to_f64!(args.contains(&(self.master.nationality.into()))),

                "is_flagship" => bool_to_f64!(self.position.is_main_flagship()),

                "has" => bool_to_f64!(self.gears.has(*args.first()? as u16)),
                "has_any" => bool_to_f64!(args.into_iter().any(|arg| self.gears.has(arg as u16))),
                "has_gear_type" => bool_to_f64!(self.gears.has_type((*args.first()?).into())),
                "has_any_gear_type" => {
                    bool_to_f64!(args.into_iter().any(|arg| self.gears.has_type(arg.into())))
                }

                "count" => self.gears.count(*args.first()? as u16) as f64,
                "count_gear_type" => self.gears.count_type((*args.first()?).into()) as f64,

                "has_historical_aircraft" => {
                    let arg = *args.first()?;
                    let result = self
                        .planes()
                        .any(|plane| plane.historical_aircraft_group as f64 == arg);
                    bool_to_f64!(result)
                }
                "has_any_historical_aircraft" => {
                    let result = args.into_iter().any(|arg| {
                        self.planes()
                            .any(|plane| plane.historical_aircraft_group as f64 == arg)
                    });

                    bool_to_f64!(result)
                }

                _ => {
                    let attr = ShipAttr::from_str(name).ok()?;
                    bool_to_f64!(self.has_attr(attr))
                }
            };

            Some(result)
        }
    }
}

pub type BattleMemberRef<'a> = BattleMember<&'a Ship>;
pub type BattleMemberMut<'a> = BattleMember<&'a mut Ship>;
