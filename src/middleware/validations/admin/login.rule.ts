import { body } from 'express-validator';

export let loginRule = [
    body('email').notEmpty().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required')
]