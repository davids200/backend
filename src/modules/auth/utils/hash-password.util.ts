// WHY ARGON2?

// Better modern protection against:

// GPU attacks
// brute force
// rainbow tables

// Preferred over bcrypt today.



import * as argon2 from 'argon2';

export async function hashPassword(
  password: string,
) {

  return argon2.hash(password);
}