import textCleaner from "../algorithms/textCleaner";
import kmp from "../algorithms/string-matching/kmp";
import similarityCheck from "../algorithms/string-matching/similarityCheck";
import prisma from "@/libs/prisma";

type QnA = {
  id: string;
  question: string;
  answer: string;
  userId: string | null;
};

type QnAWithPercentage = QnA & { similarityPercentage: number };

const deleteHandler = async (query: string, session: any): Promise<string> => {
  let question = query.split("pertanyaan")[1].trim();

  const userQnA = await prisma.qnA.findMany({
    where: {
      user: { email: session?.user?.email as string },
    },
  });
  const QnAs_with_percentage: QnAWithPercentage[] = [];

  let existQuestion: QnA | QnAWithPercentage | undefined;
  const matchKmp: QnA[] = [];

  userQnA.forEach((QnA) => {
    if (kmp(QnA.question, question)) {
      matchKmp.push(QnA);
    }
    const similarityPercentage = similarityCheck(QnA.question, question);
    QnAs_with_percentage.push({
      ...QnA,
      similarityPercentage,
    });
  });

  QnAs_with_percentage.sort(
    (a, b) => b.similarityPercentage - a.similarityPercentage
  );

  if (matchKmp.length == 1) {
    existQuestion = matchKmp[0];
  } else if (
    QnAs_with_percentage.length > 0 &&
    QnAs_with_percentage[0].similarityPercentage > 0.9
  ) {
    existQuestion = QnAs_with_percentage[0];
  }

  if (existQuestion) {
    await prisma.qnA.delete({
      where: {
        id: existQuestion.id,
      },
    });

    return `Pertanyaan "${question}" berhasil dihapus!`;
  } else {
    return `Pertanyaan "${question}" tidak ditemukan pada database!`;
  }
};

export default deleteHandler;
