const errorCodes = require("../constants/errorCodes.constants");

function successRes(message, details = {}, optionalCode) {
  return {
    code: optionalCode || "0000",
    message,
    details,
  };
}

function errorRes(message, details = {}, optionalCode, error) {
  const code = optionalCode || error?.code || errorCodes.UN_AUTH;

  if (code === errorCodes.MISSING_FIELDS) {
    return {
      code,
      message: "Missing Fields",
      details: { message: `${error?.column} is required` },
    };
  }

  if (code === errorCodes.DUPLICATES) {
    return {
      code,
      message: "Duplicate value",
      details: { message: `Constraint: ${error?.constraint}` },
    };
  }

  const detaledObj = typeof details === "string" ? { error: details } : details;
  return {
    code: code,
    message,
    details: detaledObj,
  };
}

/*
{
  "code": "0000",
  "message": "message",
  "details": [
    {
      "uid": "e1",
      "eventName": "Annual Meetup",
      "status": "pending",
      "assignedToUid": "1234"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalRecords": 125,
    "totalPages": 7
  },
  "filtersApplied": {
    "status": ["pending", "assigned"],
    "assignedToUid": "1234"
  }
}
*/

module.exports = {
  successRes,
  errorRes,
};
