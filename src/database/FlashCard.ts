import { db } from "#database";
import { MemberData } from "./interfaces/MemberData.js";

const getUserFlashcards = async (userId: string): Promise<MemberData["flashcards"]> => {
    return (await db.members.get(`${userId}.flashcards`)) || [];
};

const addUserFlashcard = async (userId: string, flashcard: { question: string; answer: string }): Promise<void> => {
    const flashcards = await getUserFlashcards(userId);
    flashcards.push(flashcard);
    await db.members.set(`${userId}.flashcards`, flashcards);
};

const updateUserFlashcard = async (userId: string, index: number, newFlashcard: { question: string; answer: string }): Promise<void> => {
    const flashcards = await getUserFlashcards(userId);
    if (index >= 0 && index < flashcards.length) {
        flashcards[index] = newFlashcard;
        await db.members.set(`${userId}.flashcards`, flashcards);
    }
};

const deleteUserFlashcard = async (userId: string, index: number): Promise<void> => {
    const flashcards = await getUserFlashcards(userId);
    if (index >= 0 && index < flashcards.length) {
        flashcards.splice(index, 1);
        await db.members.set(`${userId}.flashcards`, flashcards);
    }
};

export { getUserFlashcards, addUserFlashcard, updateUserFlashcard, deleteUserFlashcard };
