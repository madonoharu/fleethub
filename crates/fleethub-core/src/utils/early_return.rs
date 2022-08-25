macro_rules! some_or_return {
    ($from:expr) => {{
        if let Some(f) = $from {
            f
        } else {
            return;
        }
    }};
    ($from:expr, $default_result:expr) => {{
        if let Some(f) = $from {
            f
        } else {
            return $default_result;
        }
    }};
}

pub(crate) use some_or_return;
