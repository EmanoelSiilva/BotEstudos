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

const updateUserGoal = async (userId: string, index: number, newGoal: Goal): Promise<void> => {
    const goals = await getUserGoals(userId);
    if (index >= 0 && index < goals.length) {
        goals[index] = newGoal;
        await db.members.set(`${userId}.goals`, goals);
    }
};

const deleteUserGoal = async (userId: string, index: number): Promise<void> => {
    const goals = await getUserGoals(userId);
    if (index >= 0 && index < goals.length) {
        goals.splice(index, 1);
        await db.members.set(`${userId}.goals`, goals);
    }
};

export { getUserGoals, addUserGoal, updateUserGoal, deleteUserGoal };
