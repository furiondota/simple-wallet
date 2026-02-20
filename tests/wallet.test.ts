import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

declare const simnet: any;

describe("Simple Wallet Contract - Comprehensive Tests", () => {
  const accounts = simnet.getAccounts();
  const deployer = accounts.get("deployer")!;
  const user1 = accounts.get("wallet_1")!;
  const user2 = accounts.get("wallet_2")!;
  const user3 = accounts.get("wallet_3")!;


  describe("Deposit Functionality", () => {
    it("should allow user to deposit funds", () => {
      const depositAmount = 1000;

      const result = simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(depositAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Deposited"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(depositAmount);
    });

    it("should allow multiple deposits from same user", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(500)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(300)],
        user1
      );

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(800);
    });

    it("should allow multiple users to deposit", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(2000)],
        user2
      );

      const balance1 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance1.result).toBeUint(1000);

      const balance2 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user2)],
        deployer
      );
      expect(balance2.result).toBeUint(2000);
    });

    it("should allow deposit of zero amount", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(0)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Deposited"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(0);
    });

    it("should handle large deposit amounts", () => {
      const largeAmount = 1000000000;

      const result = simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(largeAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Deposited"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(largeAmount);
    });
  });

  describe("Withdrawal Functionality", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );
    });

    it("should allow user to withdraw funds", () => {
      const withdrawAmount = 500;

      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(withdrawAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Withdrawn"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(500);
    });

    it("should allow multiple withdrawals", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(200)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(300)],
        user1
      );

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(500);
    });

    it("should allow withdrawal of exact balance", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(1000)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Withdrawn"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(0);
    });

    it("should prevent withdrawal exceeding balance", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(1500)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(101));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(1000);
    });

    it("should allow withdrawal of zero amount", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(0)],
        user1
      );

      expect(result.result).toBeOk(Cl.stringAscii("Withdrawn"));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(1000);
    });

    it("should prevent withdrawal from user with zero balance", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(100)],
        user2
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });

    it("should handle multiple users withdrawing from their own balances", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(2000)],
        user2
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(300)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(500)],
        user2
      );

      const balance1 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance1.result).toBeUint(700);

      const balance2 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user2)],
        deployer
      );
      expect(balance2.result).toBeUint(1500);
    });
  });

  describe("Balance Queries", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );
    });

    it("should return correct balance for user with deposits", () => {
      const result = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(result.result).toBeUint(1000);
    });

    it("should return zero for user with no deposits", () => {
      const result = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user2)],
        deployer
      );

      expect(result.result).toBeUint(0);
    });

    it("should allow anyone to query any user's balance", () => {
      const result = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        user2
      );

      expect(result.result).toBeUint(1000);
    });

    it("should reflect balance changes after operations", () => {
      let balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(1000);

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(500)],
        user1
      );

      balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(1500);

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(700)],
        user1
      );

      balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(800);
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple operations on same user", () => {
      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(
          "simple-wallet",
          "deposit",
          [Cl.uint(100)],
          user1
        );
      }

      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          "simple-wallet",
          "withdraw",
          [Cl.uint(100)],
          user1
        );
      }

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(200);
    });

    it("should handle concurrent operations on different users", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(300)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(2000)],
        user2
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(500)],
        user2
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1500)],
        user3
      );

      const balance1 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance1.result).toBeUint(700);

      const balance2 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user2)],
        deployer
      );
      expect(balance2.result).toBeUint(1500);

      const balance3 = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user3)],
        deployer
      );
      expect(balance3.result).toBeUint(1500);
    });

    it("should handle deposit after withdrawal", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(500)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(800)],
        user1
      );

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(balance.result).toBeUint(1300);
    });

    it("should handle withdrawal attempt after multiple deposits", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(100)],
        user1
      );
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(200)],
        user1
      );
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(300)],
        user1
      );

      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(1000)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(101));

      const balance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );
      expect(balance.result).toBeUint(600);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle complete lifecycle for multiple users", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(2000)],
        user2
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(3000)],
        user3
      );

      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user1)], deployer).result
      ).toBeUint(1000);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user2)], deployer).result
      ).toBeUint(2000);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user3)], deployer).result
      ).toBeUint(3000);

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(300)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(500)],
        user2
      );

      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user1)], deployer).result
      ).toBeUint(700);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user2)], deployer).result
      ).toBeUint(1500);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user3)], deployer).result
      ).toBeUint(3000);

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(500)],
        user1
      );

      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(1000)],
        user3
      );

      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user1)], deployer).result
      ).toBeUint(1200);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user2)], deployer).result
      ).toBeUint(1500);
      expect(
        simnet.callReadOnlyFn("simple-wallet", "get-balance", [Cl.principal(user3)], deployer).result
      ).toBeUint(4000);
    });

    it("should handle alternating deposits and withdrawals", () => {
      const operations = [
        { type: "deposit", amount: 1000 },
        { type: "withdraw", amount: 300 },
        { type: "deposit", amount: 200 },
        { type: "withdraw", amount: 400 },
        { type: "deposit", amount: 500 },
        { type: "withdraw", amount: 600 },
      ];

      let expectedBalance = 0;

      operations.forEach((op) => {
        if (op.type === "deposit") {
          const result = simnet.callPublicFn(
            "simple-wallet",
            "deposit",
            [Cl.uint(op.amount)],
            user1
          );
          expect(result.result).toBeOk(Cl.stringAscii("Deposited"));
          expectedBalance += op.amount;
        } else {
          if (expectedBalance >= op.amount) {
            const result = simnet.callPublicFn(
              "simple-wallet",
              "withdraw",
              [Cl.uint(op.amount)],
              user1
            );
            expect(result.result).toBeOk(Cl.stringAscii("Withdrawn"));
            expectedBalance -= op.amount;
          } else {
            const result = simnet.callPublicFn(
              "simple-wallet",
              "withdraw",
              [Cl.uint(op.amount)],
              user1
            );
            expect(result.result).toBeErr(Cl.uint(101));
          }
        }
      });

      const finalBalance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(finalBalance.result).toBeUint(expectedBalance);
    });

    it("should handle maximum possible operations within test constraints", () => {
      // Perform 20 operations in sequence
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "simple-wallet",
          "deposit",
          [Cl.uint(100)],
          user1
        );
      }

      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(
          "simple-wallet",
          "withdraw",
          [Cl.uint(100)],
          user1
        );
      }

      const finalBalance = simnet.callReadOnlyFn(
        "simple-wallet",
        "get-balance",
        [Cl.principal(user1)],
        deployer
      );

      expect(finalBalance.result).toBeUint(500);
    });
  });

  describe("Error Code Verification", () => {
    it("should return error code u101 for insufficient balance", () => {
      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(100)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });

    it("should always return u101 for any insufficient balance scenario", () => {
      simnet.callPublicFn(
        "simple-wallet",
        "deposit",
        [Cl.uint(50)],
        user1
      );

      const result = simnet.callPublicFn(
        "simple-wallet",
        "withdraw",
        [Cl.uint(100)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });
  });
});
