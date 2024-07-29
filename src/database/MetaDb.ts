import { db } from "#database";
import { Goal } from "./interfaces/Goal.js";

const getUserGoals = async (userId: string): Promise<Goal[]> => {
    return await db.members.get(`${userId}.goals`) || [];
};

const addUserGoal = async (userId: string, goal: Goal): Promise<void> => {
    const goals = await getUserGoals(userId);
    goals.push(goal);
    await db.members.set(`${userId}.goals`, goals);
};

export { getUserGoals, addUserGoal };
