const cellSeclectList = [{
  value:'高'
},{
  value:'中'
},{
  value:'低'
}];

export const getCellSeclectList = () => {
  return cellSeclectList;
};

const cellRenderValues = {
  TEXT: true,
  NUMBER: true,
  SELECT: false,
  DATE: false,
  PEOPLESEARCH: false,
  PEOPLESEARCHSINGLE: false,
  STATUS: false,
  RICHTEXT:false,
  ATTACHMENT:false,
  CHECKBOX: false,
  DATETIMESLOT:false,
  COLUMNLINK: false,
  COLUMNLINKMULTI:false
};

export const getCellRenderValues = () => {
  return Object.assign({}, cellRenderValues);
};

const cellPopupHeight = {
  DATE: 400,
  // PEOPLESEARCH: 364,
  // PEOPLESEARCHSINGLE: 364,
  STATUS: 200,
  SELECT: 200,
  SUMMARY: 120,
  DATETIMESLOT: 400,
  SUBTASKSTATUS: 300,
  RICHTEXT: 232,
  SUBTASKSOURCE: 300,
  ATTACHMENT: 250,
  PEOPLESEARCH: 120, 
  PEOPLESEARCHSINGLE: 120,
};
export const getCellPopupHeight = (type) => {
  if (type) {
    return cellPopupHeight[type];
  }

  return Object.assign({}, cellPopupHeight);
};

export  const cellDisplayWidth = {
  // setup at the backend as enum
  NONE: 22,
  ATTACHMENT: 120,
  CHECKBOX: 100,
  COLUMNLINK: 140,
  DATE: 120,
  DATETIMESLOT: 200,
  NUMBER: 140,
  // PEOPLESEARCH: 120,           // allow multiple as default
  // PEOPLESEARCHSINGLE: 120,     // allow single only
  RICHTEXT: 275,
  STATUS: 100,
  STATUSIMPORTANT: 140,      // 默认高、中、低
  SUBTASK:100,
  TASKFLOW:100,
  SUBTASKSTATUS:100,
  SUBTASKSOURCE:100,
  TEXT: 145,
  HIDDEN: 0,
   // TODO: noet setup at the backend as enum
  ROWSELECT: 36,
  ROWACTION: 22,
  GROUPTITLE: 345,
  SUBITEM: 80,
  SELECT: 110,
  LINK: 140,
  PEOPLESEARCH: 90,
  PEOPLESEARCHSINGLE: 90,
  COLUMNDETAIL: 100,
  COLUMNLINKMULTI:120,
  FLAG:50,
  DATEMIRROR: 150,
  CHECKBOXMIRROR:150 ,
  DATETIMESLOTMIRROR: 200,
  STATUSMIRROR: 150,
  TASKFLOWSTATUSMIRROR: 130,
  COLUMNMIRROR:150,
  NAMEDITEMMNGRCOLUMNLINK:150,
  EXPORTATTACHMENT:150
};

export const getCellWidth = (type) => {
  return cellDisplayWidth[type];
};

export const DateCellSummaryRule = {
  EARLIEST: {
    key: 'EARLIEST'
  },

  LATEST: {
    key: 'LATEST'
  },
};

export const StatusCellProperties = {
  DEFAULT:{
    key: 1,
    color: '#c4c4c4',
    value: '空',
  }
};


export const compareUserValue = (users1, users2) => {
  let sortUser1 = sortUserValueById(users1);
  let sortUser2 = sortUserValueById(users2);

  return JSON.stringify(sortUser1) !== JSON.stringify(sortUser2);
};

const sortUserValueById = (arr) => {
  if (arr && arr.length > 0) {
    arr.sort(function (a, b) {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });
  }

  return arr;
};

export const getCellSelectedStyle = () => {
  return {
    border: '1px solid #0073BB',
  };
};
