use std::{cmp::Ordering, io};

use rand::Rng;

fn main() {
    println!("Guess the no.");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("please input your guess");

        let mut guess = String::new();

        io::stdin().read_line(&mut guess).expect("enter the number");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("you guessed : {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small"),
            Ordering::Greater => println!("Too big"),
            Ordering::Equal => {
                println!("you win!!!!");
                break;
            }
        }
    }
}

