export const electionFacts = [
  "India has the world's largest electorate — 968 million voters in 2024.",
  "ECI was established in 1950 under Article 324 of the Constitution.",
  "Model Code of Conduct typically kicks in 6-8 weeks before election.",
  "EVMs have been used in all Indian elections since 2004.",
  "NOTA was introduced by Supreme Court order in 2013.",
  "The First-Past-The-Post (FPTP) system means the candidate with the highest votes wins, even if it's less than 50%.",
  "Candidates must submit an affidavit (Form 26) declaring their assets, liabilities, and criminal records.",
  "The campaign expenditure limit for a Lok Sabha constituency is ₹70 to ₹95 lakhs, depending on the state.",
  "A candidate loses their security deposit (₹25,000 for Lok Sabha) if they fail to secure at least one-sixth of the valid votes.",
  "The Election Commission of India operates independently and its Chief Election Commissioner is appointed by the President.",
  "Voter Verifiable Paper Audit Trail (VVPAT) machines were introduced to provide physical verification of votes cast electronically.",
  "No campaigning is allowed within 100 meters of a polling booth on election day.",
  "A 'Silence Period' begins 48 hours before the end of polling, during which no public rallies or canvassing are allowed.",
  "The indelible ink applied to voters' fingers is produced exclusively by Mysore Paints and Varnish Limited.",
  "India's first general election took place over four months in 1951-1952.",
  "Political parties are recognized as 'National' or 'State' parties based on their performance in recent elections.",
  "Government machinery and transport cannot be used for campaign purposes under the Model Code of Conduct.",
  "Exit polls are banned from the start of the first phase of polling until 30 minutes after the last phase concludes.",
  "EVMs are not connected to the internet and are standalone machines, ensuring they cannot be hacked remotely.",
  "In remote areas, polling officials sometimes travel by boat, elephant, or on foot to ensure every voter can cast their ballot."
];

export function getRandomFact() {
  return electionFacts[Math.floor(Math.random() * electionFacts.length)];
}
