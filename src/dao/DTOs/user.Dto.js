/* The UserDto class is a JavaScript class that constructs a user data transfer object with properties
such as id, name, email, age, and roll. */
export default class UserDto {
  constructor(user) {
    (this._id = user._id),
      (this.first_name = user.first_name),
      (this.last_name = user.last_name),
      (this.name = `${this.first_name} ${this.last_name}`),
      (this.email = user.email),
      (this.age = user.age),
      (this.roll = user.roll);
  }
}
