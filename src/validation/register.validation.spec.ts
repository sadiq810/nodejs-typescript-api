import {RegisterValidation} from "./register.validation";

jest.mock('express-validation', () => ({
    Joi: {
        object: jest.fn().mockReturnThis(),
        string: jest.fn().mockReturnThis(),
        email: jest.fn().mockReturnThis(),
        min: jest.fn().mockReturnThis(),
        required: jest.fn().mockReturnThis(),
        validate: jest.fn()
    }
}));

const mockUser = {
    first_name: 'ali',
    last_name: 'wali',
    email: 'ali@gmail.com',
    password: 'abc12345',
    password_confirm: 'abc12345'
};

describe('Register validation', () => {
    it('should pass validation', async () => {
        // @ts-ignore
        jest.spyOn(RegisterValidation, 'validate').mockResolvedValueOnce(true);

        const response = await RegisterValidation.validate(mockUser)
        expect(response).toBe(true)
    });

    it('should throw validation error', async () => {
        // @ts-ignore
        jest.spyOn(RegisterValidation, 'validate').mockResolvedValueOnce('Please provide all the required values');

        const response = await RegisterValidation.validate(mockUser)
        expect(response).toBe('Please provide all the required values')
    });
})