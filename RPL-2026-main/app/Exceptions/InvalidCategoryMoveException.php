<?php

namespace App\Exceptions;

use Exception;

/**
 * InvalidCategoryMoveException
 *
 * Thrown when attempting to move an evaluation sub-category to a category
 * that belongs to a different accreditation template.
 *
 * This ensures data integrity by preventing cross-template operations
 * that could corrupt the hierarchical structure.
 */
class InvalidCategoryMoveException extends Exception
{
    /**
     * Create a new exception instance.
     *
     * @return void
     */
    public function __construct(
        string $message = 'Cannot move sub-category to a category in a different template',
        int $code = 422,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }

    /**
     * Render the exception as an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function render($request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $this->getMessage(),
                'error' => 'invalid_category_move',
            ], $this->getCode());
        }

        return redirect()
            ->back()
            ->withErrors(['category_id' => $this->getMessage()])
            ->withInput();
    }
}
