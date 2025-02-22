import {describe, expect, it} from "vitest";
import {A} from "./index.ts";

describe("Vitest 테스트", () =>{
    it("1 + 1 = 2 입니다.", () => {
        // Given
        const calculator = new A();

        const result  = calculator.Add(1, 1);
        expect(result).toBe(2);
    })
})