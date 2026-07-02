<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('discussion_messages', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('submission_discussion_id');
    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('parent_message_id')->nullable();

    $table->text('message');

    $table->string('attachment')->nullable();

    $table->timestamps();

    $table->softDeletes();

    $table->index('submission_discussion_id');
    $table->index('user_id');
    $table->index('parent_message_id');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discussion_messages');
    }
};
