
// its getting irritating writing 
// throw Object.assign(
//             new Error("No revenue to disburse for this period"),
//             { statusCode: 400 }
//       );

// everywhere everytime

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}