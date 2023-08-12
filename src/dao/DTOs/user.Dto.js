/* The UserDto class is a JavaScript class that constructs a user data transfer object with properties
such as id, name, email, age, and roll. */
export default class UserDto {
  constructor(user) {
    let today = new Date();
    (this._id = user._id),
      (this.first_name = user.first_name),
      (this.last_name = user.last_name),
      (this.name = `${this.first_name} ${this.last_name}`),
      (this.email = user.email),
      (this.status = user.status),
      (this.age = user.age),
      (this.roll = user.roll ? user.roll : "USER"),
      (this.last_connection = user.last_connection
        ? new Date(user.last_connection).toLocaleDateString("en-US")
        : new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US"));
  }
}
