use std::ops::{Add, Div, Mul, Sub};

pub enum Estimation<T> {
    Just(T),
    Rough(T),
    Unknown,
}

use Estimation::*;

impl<T> Estimation<T> {
    #[inline]
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Estimation<U> {
        match self {
            Just(x) => Just(f(x)),
            Rough(x) => Rough(f(x)),
            Unknown => Unknown,
        }
    }

    #[inline]
    pub fn and_then<U, F: FnOnce(T) -> Estimation<U>>(self, f: F) -> Estimation<U> {
        match self {
            Just(x) => f(x),
            Rough(x) => f(x),
            Unknown => Unknown,
        }
    }
}

macro_rules! impl_ops {
    ($trait: ident, $fn: ident) => {
        impl<T: $trait<Output = T>> $trait<T> for Estimation<T> {
            type Output = Self;

            #[inline]
            fn $fn(self, rhs: T) -> Self::Output {
                match self {
                    Just(x) => Just(x.$fn(rhs)),
                    Rough(x) => Rough(x.$fn(rhs)),
                    Unknown => Rough(rhs),
                }
            }
        }

        impl<T: $trait<Output = T>> $trait<Self> for Estimation<T> {
            type Output = Self;

            #[inline]
            fn $fn(self, rhs: Self) -> Self::Output {
                match rhs {
                    Just(r) => self.$fn(r),
                    Rough(r) => self.$fn(r),
                    Unknown => self,
                }
            }
        }
    };
}

impl_ops!(Add, add);
impl_ops!(Sub, sub);
impl_ops!(Mul, mul);
impl_ops!(Div, div);
