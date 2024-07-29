import { db } from "#database";
import { Goal } from "./interfaces/Goal.js";


const parseGoalDates = (goal: any): Goal => ({
    ...goal,
    startDate: new Date(goal.startDate),
    endDate: new Date(goal.endDate)
});

const getUserGoals = async (userId: string): Promise<Goal[]> => {
    const goals = await db.members.get(`${userId}.goals`);
    if (Array.isArray(goals)) {
        return goals.map(parseGoalDates);
    }
    return [];
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