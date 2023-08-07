import EErrors from '../middlewares/errors/errors-enum.js';

export default (error, req, res, next) => {
    console.error("Error detectado entrando al Error Handler");
    console.error(error.cause)
    switch (error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).send({ status: "Error", error: error.message });
            // next(); para usar como middleware
            break;
        default:
            res.status(500).send({ status: "Error", error: "Unhandeld error!" })
            break;
    }
};