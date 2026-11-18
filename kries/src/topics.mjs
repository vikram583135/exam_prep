// Practice targets inferred from the syllabus and sampled 2017 formats. These are configurable.
export const exam = { id:'kries-paper-1', title:'KRIES Paper 1', minutes:120, marks:100, penalty:0.25,
  topics:[
    ['Current affairs',12],['General science',7],['Geography',6],['Social science',5],
    ['Indian society and social movements',5],['Indian and Karnataka history',8],
    ['Constitution and public administration',10],['Practical knowledge and quantitative aptitude',8],
    ['Karnataka social and cultural history',6],['Land reforms and social change',4],
    ['Karnataka economy',5],['Rural development and Panchayat Raj',6],
    ['Technology in administration',4],['Karnataka environment and development',5],['Mental ability',9]
  ]};
export const examTopics=exam.topics.map(([name])=>name);
