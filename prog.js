const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

function sequentialSearch(data, target) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].nik === target) {
      return i;
    }
  }
  return -1;
}

function ternarySearch(data, target, left, right) {
  if (right < left) return -1;

  const third = Math.floor((right - left) / 3);
  const mid1 = left + third;
  const mid2 = right - third;

  if (data[mid1].nik === target) return mid1;
  if (data[mid2].nik === target) return mid2;

  if (target < data[mid1].nik) {
    return ternarySearch(data, target, left, mid1 - 1);
  } else if (target > data[mid2].nik) {
    return ternarySearch(data, target, mid2 + 1, right);
  } else {
    return ternarySearch(data, target, mid1 + 1, mid2 - 1);
  }
}

function measureTime(data, target) {
  let result = null;
 
  const startSeq = process.hrtime();
  sequentialSearch(data, target);
  const endSeq = process.hrtime(startSeq);
  const sequentialTime = (endSeq[0] * 1e9 + endSeq[1])

  const sortedData = [...data].sort((a, b) => a.nik - b.nik);
  const startTern = process.hrtime();
  ternarySearch(sortedData, target, 0, sortedData.length - 1);
  const endTern = process.hrtime(startTern);
  const ternaryTime = (endTern[0] * 1e9 + endTern[1]) / 1e6;
  const seqIdx = sequentialSearch(data, target);
  if (seqIdx !== -1) {
    result = data[seqIdx];
  } else {
    result =
      sortedData[ternarySearch(sortedData, target, 0, sortedData.length - 1)];
  }

  return { sequentialTime, ternaryTime, result };
}

function generateData(size, targetNIK) {
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Hank",
    "Ivy",
    "Jack",
  ];

  const jobs = [
    "Dokter",
    "Guru",
    "Polisi",
    "Engineer",
    "Pengusaha",
    "Mahasiswa",
    "Seniman",
    "Penulis",
    "Pengacara",
    "Jurnalis",
  ];

  const locations = [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Medan",
    "Yogyakarta",
    "Makassar",
    "Bali",
    "Semarang",
    "Malang",
    "Maluku",
  ];

  const ages = Array.from({ length: 100 }, (_, i) => 18 + i);

  const data = Array.from({ length: size }, () => ({
    name: names[Math.floor(Math.random() * names.length)],
    nik: Math.floor(Math.random() * 1_000_000_000),
    lostDays: Math.floor(Math.random() * 100),
    job: jobs[Math.floor(Math.random() * jobs.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    age: ages[Math.floor(Math.random() * ages.length)],
  }));

  if (size > 0) {
    const targetIdx = Math.floor(Math.random() * size);
    data[targetIdx] = {
      name: names[Math.floor(Math.random() * names.length)],
      nik: targetNIK,
      lostDays: Math.floor(Math.random() * 100),
      age: ages[Math.floor(Math.random() * ages.length)],
      job: jobs[Math.floor(Math.random() * jobs.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
    };
  }

  return data;
}

app.post("/search", (req, res) => {
  const { size, nikList } = req.body;

  if (!size || !nikList || nikList.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide a valid size and NIKs." });
  }

  const data = generateData(size, nikList[0]);
  const { sequentialTime, ternaryTime, result } = measureTime(data, nikList[0]);

  res.json({
    result,
    seqTime: sequentialTime,
    ternTime: ternaryTime,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
