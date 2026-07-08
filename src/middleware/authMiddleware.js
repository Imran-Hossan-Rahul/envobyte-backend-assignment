/**
 * Mock Authentication Middleware
 * In a real production environment, this would verify a JWT token or Session.
 * For this assignment, it cleanly simulates an authenticated user
 * to fulfill the 'authenticated user' requirement without over-engineering.
 */
export const authenticate = (req, res, next) => {
  // Simulating a successfully logged-in user
  req.user = {
    id: 1,
    account_id: 1, // This is the crucial field Monica uses to group contacts
    name: "Admin User",
  };

  // Proceed to the next function (the controller)
  next();
};
