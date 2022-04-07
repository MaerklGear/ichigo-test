const { readFile, writeFile } = require("fs/promises");
/**
 *  the database substitute.
 *  it is used to mock the functionality of e.g. mongoose
 *  please note that in the beforeAll in the tests file
 *  the db-substitute users.json is resetted to an empty []
 *  in case you are wondering were your data is after testing
 *
 */
class UserModel {
  constructor() {}

  async getUser(id) {
    const users = await this.getAllUsers();
    return users.find((user) => user.id === id);
  }

  async getAllUsers() {
    const users = await readFile("users.json", { encoding: "utf8" });
    return JSON.parse(users);
  }

  async create(id) {
    const users = await this.getAllUsers();
    const newUser = { id, rewards: {} };
    users.push(newUser);
    await writeFile("users.json", JSON.stringify(users));
    return newUser;
  }

  async updateUser(userToUpdate) {
    const allUsers = await this.getAllUsers();
    const userToUpdateIndex = allUsers.findIndex((user) => user.id === userToUpdate.id);
    allUsers[userToUpdateIndex] = userToUpdate;
    await writeFile("users.json", JSON.stringify(allUsers));
  }

  async getWeeklyRewards(user, at) {
    const week = this.getWeekForADate(at);
    const [firstDayOfWeek] = week;
    return user.rewards[firstDayOfWeek.availableAt];
  }

  async createWeeklyRewards(user, at) {
    const week = this.getWeekForADate(at);
    const [firstDayOfWeek] = week;
    user.rewards[firstDayOfWeek.availableAt] = week;
    await this.updateUser(user);
    return week;
  }

  async redeemRewardAt(user, at) {
    // transform the date from the request
    // to be compatible with the standard Date format
    // date was passed with two-digit ms (...00Z) vs (...000Z)
    const availableAt = new Date(at).toJSON();
    const today = new Date();
    const week = this.getWeekForADate(at);
    const [firstDayOfWeek] = week;
    if (!user.rewards[firstDayOfWeek.availableAt])
      return { code: 404, message: "No rewards found for this date" };
      
    const rewardToRedeem = user.rewards[firstDayOfWeek.availableAt].find(
      (day) => day.availableAt === availableAt
    );

    if (rewardIsFree(rewardToRedeem, today)) {
      rewardToRedeem.redeemedAt = today;
      await this.updateUser(user);
      return rewardToRedeem;
    }

    return { code: 410, message: "This reward is already expired" };

    function rewardIsFree(reward, today) {
      if (rewardIsAlreadyRedeemed(reward)) return false;
      return today > new Date(reward.availableAt) && today < new Date(reward.expiresAt);
    }
    function rewardIsAlreadyRedeemed(reward) {
      if (!!reward.redeemedAt) return true;
    }
  }

  /**
   *  I don't feel completely confident calculating directly with Date Objects
   *  That´s why I prefer to use milliseconds for tasks like that
   *  with a problem of overlapping months
   *  It "feels" more reliable for me and I´ve had good experiences
   *  with it in a calendar app recently
   *
   */
  getWeekForADate(date) {
    const dateSetToMidnight = new Date(date).setUTCHours(0, 0, 0, 0);
    const day = new Date(dateSetToMidnight);

    const first = day.getDate() - day.getDay();
    const daysUntilFirstDay = Math.abs(first - day.getDate());
    const aDayInMilliseconds = 1000 * 60 * 60 * 24;
    const firstDay = new Date(day.getTime() - aDayInMilliseconds * daysUntilFirstDay);

    const redeemedAt = null;
    const week = [];

    for (let index = 0; index < 7; index++) {
      const availableAt = new Date(firstDay.getTime() + aDayInMilliseconds * index);
      const expiresAt = new Date(firstDay.getTime() + aDayInMilliseconds * (index + 1));

      week.push({
        availableAt,
        redeemedAt,
        expiresAt,
      });
    }
    return week;
  }
}

module.exports = UserModel;
