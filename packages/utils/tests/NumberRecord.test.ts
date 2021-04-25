import NumberRecord from "../src/NumberRecord";

describe("NumberRecord", () => {
  it("NumberRecord.count", () => {
    const array = ["x", "x", "x", "y", "z", "z"];
    const rec = NumberRecord.count(array);

    expect(rec.get("x")).toBe(3);
    expect(rec.get("y")).toBe(1);
    expect(rec.get("z")).toBe(2);
  });

  it("NumberRecord.rfd", () => {
    const array = [1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6];
    const rec = NumberRecord.rfd(array);

    expect(rec.get(1)).toBe(1 / array.length);
    expect(rec.get(2)).toBe(1 / array.length);
    expect(rec.get(3)).toBe(2 / array.length);
    expect(rec.get(4)).toBe(3 / array.length);
    expect(rec.get(5)).toBe(4 / array.length);
    expect(rec.get(6)).toBe(1 / array.length);
  });

  it("clone", () => {
    const rec1 = new NumberRecord<string>();
    const rec2 = rec1.clone();

    expect(rec1).not.toBe(rec2);
  });

  it("getはvalueが存在しないなら0を返す", () => {
    const rec = new NumberRecord<string>();
    expect(rec.get("a")).toBe(0);
  });

  it("set", () => {
    const rec1 = new NumberRecord<string>();
    const rec2 = rec1.set("a", 1);
    const rec3 = rec2.set("a", 2);

    expect(rec1.get("a")).toBe(0);
    expect(rec2.get("a")).toBe(1);
    expect(rec3.get("a")).toBe(2);
  });

  it("delete", () => {
    const rec1 = new NumberRecord<string>().set("a", 1);
    const rec2 = rec1.delete("a");

    expect(rec1.get("a")).toBe(1);
    expect(rec2.get("a")).toBe(0);
    expect(rec2.keys()).toEqual([]);
  });

  it("keys", () => {
    const keys = new NumberRecord<string>()
      .set("a", 1)
      .set("b", 0)
      .set("c", 3)
      .keys();
    expect(keys).toEqual(["a", "b", "c"]);
  });

  it("values", () => {
    const values = new NumberRecord<string>()
      .set("a", 1)
      .set("b", 0)
      .set("c", 3)
      .values();
    expect(values).toEqual([1, 0, 3]);
  });

  it("toArray", () => {
    const rec1 = new NumberRecord<string>({ a: 1, b: 2, c: 0, d: 4 });
    expect(rec1.toArray()).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 0],
      ["d", 4],
    ]);
  });

  it("map", () => {
    const rec1 = new NumberRecord<string>({ a: 1, b: 2 });
    const rec2 = rec1.map((value) => value * 10 + 1);

    expect(rec1.get("a")).toBe(1);
    expect(rec1.get("b")).toBe(2);
    expect(rec2.get("a")).toBe(11);
    expect(rec2.get("b")).toBe(21);
  });

  it("add", () => {
    const rec1 = new NumberRecord<string>({ x: 1, y: 2 });
    const rec2 = rec1.add("x", 10);
    const rec3 = rec2.add(rec1);

    expect(rec1.get("x")).toBe(1);
    expect(rec2.get("x")).toBe(11);
    expect(rec3.get("x")).toBe(12);
    expect(rec3.get("y")).toBe(4);
  });

  it("multiply", () => {
    const rec1 = new NumberRecord<string>({ x: 1, y: 2 });
    const rec2 = rec1.multiply(3);

    expect(rec1.get("x")).toBe(1);
    expect(rec1.get("y")).toBe(2);
    expect(rec2.get("x")).toBe(3);
    expect(rec2.get("y")).toBe(6);
  });

  it("sum", () => {
    const rec1 = new NumberRecord<string>({ a: 1, b: 2, c: 5 });
    expect(rec1.sum()).toBe(8);
  });

  it("minBy,maxBy", () => {
    const rec1 = new NumberRecord<string>();
    const rec2 = rec1.set("a", 1).set("b", 2).set("c", 3).set("d", 2);

    expect(rec1.minBy((value) => value)).toBeUndefined();
    expect(rec1.maxBy((value) => value)).toBeUndefined();
    expect(rec2.minBy((value) => value)).toEqual(["a", 1]);
    expect(rec2.maxBy((value) => value)).toEqual(["c", 3]);
  });

  it("withMut", () => {
    const rec1 = new NumberRecord<string>();
    const rec2 = rec1.withMut((self) => {
      self.set("a", 2).set("b", 3).add("b", 5).multiply(10);
    });
    const rec3 = rec2.withMut((self) => {
      self.withMut((nested) => {
        nested.set("a", 3);
      });
    });

    expect(rec1.get("a")).toBe(0);
    expect(rec1.get("b")).toBe(0);
    expect(rec2.get("a")).toBe(20);
    expect(rec2.get("b")).toBe(80);
    expect(rec3.get("a")).toBe(3);
  });
});
