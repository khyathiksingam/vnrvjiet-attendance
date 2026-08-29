// Master Data for VNR VJIET Class Attendance System

export const COLLEGE_INFO = {
  college: 'VNR VIGNANA JYOTHI INSTITUTE OF ENGINEERING & TECHNOLOGY',
  programme: 'B.Tech',
  branch: 'CSE-CYS',
  year: 'II Year',
  semester: 'I',
  section: 'Section B',
  sectionLetter: 'B',
  academicYear: '2026–2027',
  regulation: 'R25',
  tagline: 'CSE-CYS | II Year | I Semester | Section B'
};

export const COURSES = {
  'PSA': {
    code: '25BSMT204',
    name: 'Probability and Statistics with Applications',
    faculty: ['Dr. Ch Shashi Kumar'],
    room: 'E-407',
    isLab: false
  },
  'OOPJ': {
    code: '25PC1CS201',
    name: 'Object Oriented Programming through Java',
    faculty: ['Mrs. P. Devika'],
    room: 'E-407',
    isLab: false
  },
  'CN': {
    code: '25PC1CY201',
    name: 'Computer Networks',
    faculty: ['Dr. R. Vasavi'],
    room: 'E-407',
    isLab: false
  },
  'OS': {
    code: '25PC1IT204',
    name: 'Operating Systems',
    faculty: ['Dr. Putti Jyothi'],
    room: 'E-407',
    isLab: false
  },
  'DT': {
    code: '25PW4CY201',
    name: 'Design Thinking',
    faculty: ['Dr. Ch. Naveen Reddy', 'Dr. G. Radhika', 'Mrs. K. Naga Sandhya'],
    room: 'APJ-Abdul-Kalam',
    isLab: true
  },
  'CM LAB': {
    code: '25BS2MT211',
    name: 'Computational Mathematics Lab',
    faculty: ['Dr. Ch Shashi Kumar', 'Dr. P. Raja Shekar', 'Dr. Chella Anil Kumar'],
    room: 'E-330 / E-331',
    isLab: true
  },
  'OOPJ LAB': {
    code: '25PC2CS201',
    name: 'Object Oriented Programming through Java Lab',
    faculty: ['Mrs. P. Devika', 'Ms. Dhanusree'],
    room: 'E-403',
    isLab: true
  },
  'CN LAB': {
    code: '25PC2CY201',
    name: 'Computer Networks Lab',
    faculty: ['Dr. R. Vasavi', 'Mr. P. Balakesava Reddy'],
    room: 'E-502',
    isLab: true
  },
  'OS LAB': {
    code: '25PC2IT204',
    name: 'Operating Systems Lab',
    faculty: ['Dr. Putti Jyothi', 'Mr. Y. Manohar Reddy', 'Dr. M. Laxmidevi'],
    room: 'E-317',
    isLab: true
  },
  'CF LAB': {
    code: '25PC2CY211',
    name: 'Cyber Forensics Lab',
    faculty: ['Mr. A. Madhu', 'Ms. K. Sai Pragnya'],
    room: 'E-401',
    isLab: true
  },
  'CF': {
    code: '25PC2CY211',
    name: 'Cyber Forensics',
    faculty: ['Mr. A. Madhu', 'Ms. K. Sai Pragnya'],
    room: 'E-401',
    isLab: true
  },
  'DV LAB': {
    code: '25SD5CS201',
    name: 'Data Visualization Lab',
    faculty: ['Dr. M. Laxmidevi', 'Mrs. G. Vanaja Kumari', 'Mrs. Ambati Pravallika'],
    room: 'E-315 / E-316',
    isLab: true
  },
  'ES': {
    code: '25MN6HS102',
    name: 'Environmental Science',
    faculty: ['Dr. M. Brahmayya'],
    room: 'E-407',
    isLab: false
  }
};

export const STUDENTS = [
  // REGULAR STUDENTS (S.No 1 to 66)
  { sNo: 1, rollNumber: '25071A6268', name: 'AKKINAPALLI HARSHIKA', batch: 'Batch 1' },
  { sNo: 2, rollNumber: '25071A6269', name: 'ANUBAV KONDA', batch: 'Batch 1' },
  { sNo: 3, rollNumber: '25071A6270', name: 'ARYAN JADHAV', batch: 'Batch 1' },
  { sNo: 4, rollNumber: '25071A6271', name: 'ASAVATH DIVYA', batch: 'Batch 1' },
  { sNo: 5, rollNumber: '25071A6272', name: 'AVNI CHHABRA', batch: 'Batch 1' },
  { sNo: 6, rollNumber: '25071A6273', name: 'B VEEKSHITHA', batch: 'Batch 1' },
  { sNo: 7, rollNumber: '25071A6274', name: 'BANDI NANDHINI', batch: 'Batch 1' },
  { sNo: 8, rollNumber: '25071A6275', name: 'BANOTHU AKSHAY', batch: 'Batch 1' },
  { sNo: 9, rollNumber: '25071A6276', name: 'BHUVANA KRUTHI YEDURU', batch: 'Batch 1' },
  { sNo: 10, rollNumber: '25071A6277', name: 'BURRA VINAY KUMAR', batch: 'Batch 1' },
  { sNo: 11, rollNumber: '25071A6278', name: 'CHADALA SRI HARSHA VARDHAN', batch: 'Batch 1' },
  { sNo: 12, rollNumber: '25071A6279', name: 'CHITTABOINA SIDDHARTH', batch: 'Batch 1' },
  { sNo: 13, rollNumber: '25071A6280', name: 'CHENNOJU MANOJ KUMAR', batch: 'Batch 1' },
  { sNo: 14, rollNumber: '25071A6281', name: 'CHILUKURI SOWMYA SHREE', batch: 'Batch 1' },
  { sNo: 15, rollNumber: '25071A6282', name: 'CHINTALAPUDI GAYATHRI', batch: 'Batch 1' },
  { sNo: 16, rollNumber: '25071A6283', name: 'CHIROORI RITHVIK', batch: 'Batch 1' },
  { sNo: 17, rollNumber: '25071A6284', name: 'DARLA SRIHARI', batch: 'Batch 1' },
  { sNo: 18, rollNumber: '25071A6285', name: 'DEVISRI PENNALURU', batch: 'Batch 1' },
  { sNo: 19, rollNumber: '25071A6286', name: 'DODLA YASHWANTH', batch: 'Batch 1' },
  { sNo: 20, rollNumber: '25071A6287', name: 'GADESIDANKI SHIVACHARAN', batch: 'Batch 1' },
  { sNo: 21, rollNumber: '25071A6288', name: 'GAJULA VIBHU VIKHYAT', batch: 'Batch 1' },
  { sNo: 22, rollNumber: '25071A6289', name: 'GONDU SAI GITESH', batch: 'Batch 1' },
  { sNo: 23, rollNumber: '25071A6290', name: 'GOSHKE SWETHA', batch: 'Batch 1' },
  { sNo: 24, rollNumber: '25071A6291', name: 'GOUNI AISHWARYA REDDY', batch: 'Batch 1' },
  { sNo: 25, rollNumber: '25071A6292', name: 'GUGLOTH NAVATEJ', batch: 'Batch 1' },
  { sNo: 26, rollNumber: '25071A6293', name: 'JAMMU BALA AKSHAY', batch: 'Batch 1' },
  { sNo: 27, rollNumber: '25071A6294', name: 'JAMPALA RISHIKA CHOUDARY', batch: 'Batch 1' },
  { sNo: 28, rollNumber: '25071A6295', name: 'K ANJI', batch: 'Batch 1' },
  { sNo: 29, rollNumber: '25071A6296', name: 'K S INDRANEEL VARMA', batch: 'Batch 1' },
  { sNo: 30, rollNumber: '25071A6297', name: 'KAITHI VIKRANTH REDDY', batch: 'Batch 1' },
  { sNo: 31, rollNumber: '25071A6298', name: 'KAMA BHANU PRAKASH', batch: 'Batch 1' },
  { sNo: 32, rollNumber: '25071A6299', name: 'KANCHARLA JEEVAN', batch: 'Batch 1' },
  { sNo: 33, rollNumber: '25071A62A0', name: 'KANTHETI SATWIK', batch: 'Batch 1' },
  { sNo: 34, rollNumber: '25071A62A1', name: 'KASARLA PRACHETH SHARMA', batch: 'Batch 2' },
  { sNo: 35, rollNumber: '25071A62A2', name: 'KOLA JASHWANTH', batch: 'Batch 2' },
  { sNo: 36, rollNumber: '25071A62A3', name: 'KOTHA SAI TEJA', batch: 'Batch 2' },
  { sNo: 37, rollNumber: '25071A62A4', name: 'LAXMI PRANAY MASHAPATHULA', batch: 'Batch 2' },
  { sNo: 38, rollNumber: '25071A62A5', name: 'LINGAMPELLI SAI VARSHA', batch: 'Batch 2' },
  { sNo: 39, rollNumber: '25071A62A6', name: 'M AAYISHA', batch: 'Batch 2' },
  { sNo: 40, rollNumber: '25071A62A7', name: 'MADASU NAKSHATRA SAI', batch: 'Batch 2' },
  { sNo: 41, rollNumber: '25071A62A8', name: 'MAREDUPAKA ABHINAV', batch: 'Batch 2' },
  { sNo: 42, rollNumber: '25071A62A9', name: 'MEKALA SUSHANTH', batch: 'Batch 2' },
  { sNo: 43, rollNumber: '25071A62B0', name: 'MOHAMMAD SUFIYAAN', batch: 'Batch 2' },
  { sNo: 44, rollNumber: '25071A62B1', name: 'MUDUGANTI PRANAVI', batch: 'Batch 2' },
  { sNo: 45, rollNumber: '25071A62B2', name: 'NAGANDLA PRIYANKA', batch: 'Batch 2' },
  { sNo: 46, rollNumber: '25071A62B3', name: 'NIDA AZIZ', batch: 'Batch 2' },
  { sNo: 47, rollNumber: '25071A62B4', name: 'PAGI SASHANK', batch: 'Batch 2' },
  { sNo: 48, rollNumber: '25071A62B5', name: 'PATI AYUSH REDDY', batch: 'Batch 2' },
  { sNo: 49, rollNumber: '25071A62B6', name: 'PONAGANDLA SRINIDHI', batch: 'Batch 2' },
  { sNo: 50, rollNumber: '25071A62B7', name: 'PONNAM MEGHANA', batch: 'Batch 2' },
  { sNo: 51, rollNumber: '25071A62B8', name: 'REKULGI AKSHAYA SAHASRA', batch: 'Batch 2' },
  { sNo: 52, rollNumber: '25071A62B9', name: 'REKULGI ANKITHA SHRESTA', batch: 'Batch 2' },
  { sNo: 53, rollNumber: '25071A62C0', name: 'SAHITH VARMA INDUKURI', batch: 'Batch 2' },
  { sNo: 54, rollNumber: '25071A62C1', name: 'SATTI SANDEEP VISHWANTH REDDY', batch: 'Batch 2' },
  { sNo: 55, rollNumber: '25071A62C2', name: 'SATTU CHARAN', batch: 'Batch 2' },
  { sNo: 56, rollNumber: '25071A62C3', name: 'SINGAM KHYATHIK', batch: 'Batch 2' },
  { sNo: 57, rollNumber: '25071A62C4', name: 'SODA MANU', batch: 'Batch 2' },
  { sNo: 58, rollNumber: '25071A62C5', name: 'SRICHANDAN REDDY BODUGAM', batch: 'Batch 2' },
  { sNo: 59, rollNumber: '25071A62C6', name: 'SRIVANTH TYARLA', batch: 'Batch 2' },
  { sNo: 60, rollNumber: '25071A62C7', name: 'SRUJAN MOGILI', batch: 'Batch 2' },
  { sNo: 61, rollNumber: '25071A62C8', name: 'V SRI SASHI SARADHI', batch: 'Batch 2' },
  { sNo: 62, rollNumber: '25071A62C9', name: 'VANDANAPU VINAINA', batch: 'Batch 2' },
  { sNo: 63, rollNumber: '25071A62D0', name: 'VANGALA PRANAVI', batch: 'Batch 2' },
  { sNo: 64, rollNumber: '25071A62D1', name: 'YARLAGADDA NAYANASRI', batch: 'Batch 2' },
  { sNo: 65, rollNumber: '25071A62D2', name: 'YASHWANT KONDADASU', batch: 'Batch 2' },
  { sNo: 66, rollNumber: '25071A62D3', name: 'YEGGONI THRISHAL', batch: 'Batch 2' },

  // LATERAL ENTRY (LE) STUDENTS (S.No 67 to 74)
  { sNo: 67, rollNumber: '26075A6207', name: 'CHERUKU JASHWANTH GOUD', batch: 'Batch 1' },
  { sNo: 68, rollNumber: '26075A6208', name: 'KOMIRISHETTY TEJASREE', batch: 'Batch 1' },
  { sNo: 69, rollNumber: '26075A6209', name: 'KOPPARAPU SNUTHAPURNI', batch: 'Batch 1' },
  { sNo: 70, rollNumber: '26075A6210', name: 'MAMIDI SRIHARSHITHA', batch: 'Batch 1' },
  { sNo: 71, rollNumber: '26075A6211', name: 'NADIMIDODDI SRIKANTH', batch: 'Batch 2' },
  { sNo: 72, rollNumber: '26075A6212', name: 'PASTHAM VINAY KUMAR', batch: 'Batch 2' },
  { sNo: 73, rollNumber: '26075A6213', name: 'POTHURAJU PALLAVI', batch: 'Batch 2' },
  { sNo: 74, rollNumber: '26075A6214', name: 'VEMULA VYSHNAVI', batch: 'Batch 2' }
];

export const TIMETABLE = {
  'Monday': [
    {
      id: 'mon-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'PSA',
      courseCode: '25BSMT204',
      faculty: 'Dr. Ch Shashi Kumar',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'mon-2',
      startTime: '11:00 AM',
      endTime: '1:00 PM',
      startMinutes: 660,
      endMinutes: 780,
      subject: 'CM LAB',
      courseCode: '25BS2MT211',
      faculty: 'Dr. Ch Shashi Kumar, Dr. P. Raja Shekar, Dr. Chella Anil Kumar',
      room: 'E-330 / E-331',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'mon-3',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'mon-4',
      startTime: '1:40 PM',
      endTime: '2:40 PM',
      startMinutes: 820,
      endMinutes: 880,
      subject: 'CN',
      courseCode: '25PC1CY201',
      faculty: 'Dr. R. Vasavi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'mon-5',
      startTime: '2:40 PM',
      endTime: '4:40 PM',
      startMinutes: 880,
      endMinutes: 1000,
      subject: 'OS LAB / OOPJ LAB',
      courseCode: '25PC2IT204 / 25PC2CS201',
      faculty: 'Dr. Putti Jyothi, Mr. Y. Manohar Reddy, Dr. M. Laxmidevi / Mrs. P. Devika, Ms. Dhanusree',
      room: 'E-317 / E-403',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: true,
      batchDetails: {
        'Batch 1': {
          subject: 'OS LAB',
          courseCode: '25PC2IT204',
          faculty: 'Dr. Putti Jyothi, Mr. Y. Manohar Reddy, Dr. M. Laxmidevi',
          room: 'E-317'
        },
        'Batch 2': {
          subject: 'OOPJ LAB',
          courseCode: '25PC2CS201',
          faculty: 'Mrs. P. Devika, Ms. Dhanusree',
          room: 'E-403'
        }
      }
    }
  ],

  'Tuesday': [
    {
      id: 'tue-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'OS',
      courseCode: '25PC1IT204',
      faculty: 'Dr. Putti Jyothi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'tue-2',
      startTime: '11:00 AM',
      endTime: '1:00 PM',
      startMinutes: 660,
      endMinutes: 780,
      subject: 'DV LAB',
      courseCode: '25SD5CS201',
      faculty: 'Dr. M. Laxmidevi, Mrs. G. Vanaja Kumari, Mrs. Ambati Pravallika',
      room: 'E-315 / E-316',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'tue-3',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'tue-4',
      startTime: '1:40 PM',
      endTime: '2:40 PM',
      startMinutes: 820,
      endMinutes: 880,
      subject: 'PSA',
      courseCode: '25BSMT204',
      faculty: 'Dr. Ch Shashi Kumar',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'tue-5',
      startTime: '2:40 PM',
      endTime: '3:40 PM',
      startMinutes: 880,
      endMinutes: 940,
      subject: 'ES',
      courseCode: '25MN6HS102',
      faculty: 'Dr. M. Brahmayya',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'tue-6',
      startTime: '3:40 PM',
      endTime: '4:40 PM',
      startMinutes: 940,
      endMinutes: 1000,
      subject: 'OS',
      courseCode: '25PC1IT204',
      faculty: 'Dr. Putti Jyothi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    }
  ],

  'Wednesday': [
    {
      id: 'wed-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'OOPJ',
      courseCode: '25PC1CS201',
      faculty: 'Mrs. P. Devika',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'wed-2',
      startTime: '11:00 AM',
      endTime: '1:00 PM',
      startMinutes: 660,
      endMinutes: 780,
      subject: 'CN / CF LAB',
      courseCode: '25PC1CY201 / 25PC2CY211',
      faculty: 'Dr. R. Vasavi / Mr. A. Madhu, Ms. K. Sai Pragnya',
      room: 'E-407 / E-401',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: true,
      batchDetails: {
        'Batch 1': {
          subject: 'CN',
          courseCode: '25PC1CY201',
          faculty: 'Dr. R. Vasavi',
          room: 'E-407'
        },
        'Batch 2': {
          subject: 'CF LAB',
          courseCode: '25PC2CY211',
          faculty: 'Mr. A. Madhu, Ms. K. Sai Pragnya',
          room: 'E-401'
        }
      }
    },
    {
      id: 'wed-3',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'wed-4',
      startTime: '1:40 PM',
      endTime: '4:40 PM',
      startMinutes: 820,
      endMinutes: 1000,
      subject: 'DT',
      courseCode: '25PW4CY201',
      faculty: 'Dr. Ch. Naveen Reddy, Dr. G. Radhika, Mrs. K. Naga Sandhya',
      room: 'APJ-Abdul-Kalam',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    }
  ],

  'Thursday': [
    {
      id: 'thu-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'CN',
      courseCode: '25PC1CY201',
      faculty: 'Dr. R. Vasavi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'thu-2',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      startMinutes: 660,
      endMinutes: 720,
      subject: 'OOPJ',
      courseCode: '25PC1CS201',
      faculty: 'Mrs. P. Devika',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'thu-3',
      startTime: '12:00 PM',
      endTime: '1:00 PM',
      startMinutes: 720,
      endMinutes: 780,
      subject: 'PSA',
      courseCode: '25BSMT204',
      faculty: 'Dr. Ch Shashi Kumar',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'thu-4',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'thu-5',
      startTime: '1:40 PM',
      endTime: '2:40 PM',
      startMinutes: 820,
      endMinutes: 880,
      subject: 'OS',
      courseCode: '25PC1IT204',
      faculty: 'Dr. Putti Jyothi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'thu-6',
      startTime: '2:40 PM',
      endTime: '3:40 PM',
      startMinutes: 880,
      endMinutes: 940,
      subject: 'OOPJ',
      courseCode: '25PC1CS201',
      faculty: 'Mrs. P. Devika',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'thu-7',
      startTime: '3:40 PM',
      endTime: '4:40 PM',
      startMinutes: 940,
      endMinutes: 1000,
      subject: 'ECA/CCA',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    }
  ],

  'Friday': [
    {
      id: 'fri-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'OOPJ',
      courseCode: '25PC1CS201',
      faculty: 'Mrs. P. Devika',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'fri-2',
      startTime: '11:00 AM',
      endTime: '1:00 PM',
      startMinutes: 660,
      endMinutes: 780,
      subject: 'OOPJ LAB / OS LAB',
      courseCode: '25PC2CS201 / 25PC2IT204',
      faculty: 'Mrs. P. Devika, Ms. Dhanusree / Dr. Putti Jyothi, Mr. Y. Manohar Reddy, Dr. M. Laxmidevi',
      room: 'E-403 / E-317',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: true,
      batchDetails: {
        'Batch 1': {
          subject: 'OOPJ LAB',
          courseCode: '25PC2CS201',
          faculty: 'Mrs. P. Devika, Ms. Dhanusree',
          room: 'E-403'
        },
        'Batch 2': {
          subject: 'OS LAB',
          courseCode: '25PC2IT204',
          faculty: 'Dr. Putti Jyothi, Mr. Y. Manohar Reddy, Dr. M. Laxmidevi',
          room: 'E-317'
        }
      }
    },
    {
      id: 'fri-3',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'fri-4',
      startTime: '1:40 PM',
      endTime: '2:40 PM',
      startMinutes: 820,
      endMinutes: 880,
      subject: 'CN',
      courseCode: '25PC1CY201',
      faculty: 'Dr. R. Vasavi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'fri-5',
      startTime: '2:40 PM',
      endTime: '4:40 PM',
      startMinutes: 880,
      endMinutes: 1000,
      subject: 'CF / CN LAB',
      courseCode: '25PC2CY211 / 25PC2CY201',
      faculty: 'Mr. A. Madhu, Ms. K. Sai Pragnya / Dr. R. Vasavi, Mr. P. Balakesava Reddy',
      room: 'E-401 / E-502',
      isAttendanceRequired: true,
      isContinuous: true,
      hasBatchSplit: true,
      batchDetails: {
        'Batch 1': {
          subject: 'CF',
          courseCode: '25PC2CY211',
          faculty: 'Mr. A. Madhu, Ms. K. Sai Pragnya',
          room: 'E-401'
        },
        'Batch 2': {
          subject: 'CN LAB',
          courseCode: '25PC2CY201',
          faculty: 'Dr. R. Vasavi, Mr. P. Balakesava Reddy',
          room: 'E-502'
        }
      }
    }
  ],

  'Saturday': [
    {
      id: 'sat-1',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startMinutes: 600,
      endMinutes: 660,
      subject: 'OS',
      courseCode: '25PC1IT204',
      faculty: 'Dr. Putti Jyothi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'sat-2',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      startMinutes: 660,
      endMinutes: 720,
      subject: 'ES',
      courseCode: '25MN6HS102',
      faculty: 'Dr. M. Brahmayya',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'sat-3',
      startTime: '12:00 PM',
      endTime: '1:00 PM',
      startMinutes: 720,
      endMinutes: 780,
      subject: 'CN',
      courseCode: '25PC1CY201',
      faculty: 'Dr. R. Vasavi',
      room: 'E-407',
      isAttendanceRequired: true,
      hasBatchSplit: false,
      batch: 'All Students',
      batchDetails: null
    },
    {
      id: 'sat-4',
      startTime: '1:00 PM',
      endTime: '1:40 PM',
      startMinutes: 780,
      endMinutes: 820,
      subject: 'LUNCH',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'sat-5',
      startTime: '1:40 PM',
      endTime: '2:40 PM',
      startMinutes: 820,
      endMinutes: 880,
      subject: 'MTP',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'sat-6',
      startTime: '2:40 PM',
      endTime: '3:40 PM',
      startMinutes: 880,
      endMinutes: 940,
      subject: 'CVA-L2',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    },
    {
      id: 'sat-7',
      startTime: '3:40 PM',
      endTime: '4:40 PM',
      startMinutes: 940,
      endMinutes: 1000,
      subject: 'LIBRARY',
      courseCode: '-',
      faculty: '-',
      room: '-',
      isAttendanceRequired: false,
      isFreePeriod: true
    }
  ]
};

export const USERS_SEED = [
  {
    username: 'admin',
    displayName: 'C.Rithvik',
    role: 'admin',
    groupName: 'Administration',
    defaultPassword: 'admin'
  }
];
