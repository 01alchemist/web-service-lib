import { env, envInt, envFloat, envBoolean, envJson } from "./env";

describe("env test suite", () => {
  describe("When reading string env variable", () => {
    it("Should return string", () => {
      process.env.STRING_VALUE = "STRING_VALUE";
      expect(env("STRING_VALUE", "DEFAULT_VALUE")).toBe("STRING_VALUE");
    });
  });

  describe("When reading undefined string env variable", () => {
    it("Should return default value", () => {
      delete process.env.STRING_VALUE;
      expect(env("STRING_VALUE", "DEFAULT_VALUE")).toBe("DEFAULT_VALUE");
    });
  });

  describe("When reading int env variable", () => {
    it("Should return int", () => {
      process.env.INT_VALUE = "9835591278";
      expect(envInt("INT_VALUE", 1)).toBe(9835591278);
    });
  });

  describe("When reading undefined int env variable", () => {
    it("Should return default value", () => {
      delete process.env.INT_VALUE;
      expect(envInt("INT_VALUE", 1)).toBe(1);
    });
  });

  describe("When reading float env variable", () => {
    it("Should return float", () => {
      process.env.FLOAT_VALUE = "5.2694168";
      expect(envFloat("FLOAT_VALUE", 1.5)).toBe(5.2694168);
    });
  });

  describe("When reading undefined float env variable", () => {
    it("Should return default value", () => {
      delete process.env.FLOAT_VALUE;
      expect(envFloat("FLOAT_VALUE", 1.5)).toBe(1.5);
    });
  });

  describe("When reading boolean:true env variable", () => {
    it("Should return boolean:true", () => {
      process.env.BOOLEAN_VALUE = "true";
      expect(envBoolean("BOOLEAN_VALUE", false)).toBe(true);
    });
  });

  describe("When reading boolean:false env variable", () => {
    it("Should return boolean:false", () => {
      process.env.BOOLEAN_VALUE = "false";
      expect(envBoolean("BOOLEAN_VALUE", false)).toBe(false);
    });
  });

  describe("When reading undefined float env variable", () => {
    it("Should return default value", () => {
      delete process.env.BOOLEAN_VALUE;
      expect(envBoolean("BOOLEAN_VALUE", true)).toBe(true);
    });
  });

  describe("envJson test suite", () => {
    describe("When reading valid json env variable", () => {
      it("Should return parsed json value", () => {
        process.env.JSON_VALUE = `{ "value": "some-value" }`;
        expect(envJson("JSON_VALUE")).toEqual({ value: "some-value" });
      });
    });
    describe("When reading invalid json env variable", () => {
      it("Should return parsed json value", () => {
        process.env.JSON_VALUE = `{ value: "some-value" }`;
        expect(envJson("JSON_VALUE")).toBeUndefined();
      });
    });
    describe("When reading undefined json env variable", () => {
      it("Should return default value", () => {
        delete process.env.JSON_VALUE;
        expect(envJson("JSON_VALUE", { value: true })).toEqual({
          value: true
        });
      });
      it("Should return undefined if no default value", () => {
        delete process.env.JSON_VALUE;
        expect(envJson("JSON_VALUE")).toBeUndefined();
      });
    });
  });
});
