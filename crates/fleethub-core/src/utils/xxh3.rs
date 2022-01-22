use std::hash::{Hash, Hasher};
use xxhash_rust::xxh3::Xxh3;

pub fn xxh3<T: Hash>(input: &T) -> u64 {
    let mut hasher = Xxh3::new();
    input.hash(&mut hasher);
    hasher.finish()
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_xxh3() {
        assert_eq!(xxh3(&1), 15781232456890734344);
        assert_eq!(xxh3(&"foo"), 8490382581592501473);
    }
}
