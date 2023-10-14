## Rise In Solana Counter Program  

# Homework#1 : Reset Function for counter program

**This is a simple Solana program that demonstrates how to interact with a counter stored in a greeting account on the Solana blockchain. The program allows you to increment, decrement, and reset the counter, and it provides a basic test case to ensure that the operations work as expected.**

**This is counter yaml file** 
```yaml
    cidl: "0.8"
info:
  name: counter
  title: Patika Counter
  version: 0.0.1
  license:
    name: Unlicense
    identifier: Unlicense
types:
  GreetingAccount:
    fields:
      - name: counter
        type: u32
methods:
  - name: increment
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana:
          attributes: [mut, init_if_needed]
  - name: decrement
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana:
          attributes: [mut, init_if_needed]
  - name: reset
    inputs: 
      - name: greeting_account
        type: GreetingAccount
        solana: 
          attributes: [mut, init_if_needed]
```

# To generate code

```javascript
    codigo solana generate counter.yaml
```

# Task 2: Add the increment codes  

```rust 
        pub fn increment(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter += 1;
            Ok(())
        }   
```

# Task 3: Add the Decrement codes  

```rust
 pub fn decrement(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter -= 1;

            Ok(())
        }

```

# Task 4: Add the Reset codes  

```rust
  pub fn reset(
            program_id: &Pubkey,
            greeting_account: &mut Account<GreetingAccount>,
        ) -> ProgramResult {
            greeting_account.data.counter = 0;
            Ok(())
        }

```

