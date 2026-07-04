<?php

namespace App\Observers;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ProposalObserver
{
    /**
     * Handle the "created" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function created($model): void
    {
        $this->logActivity('created', $model);
    }

    /**
     * Handle the "updated" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function updated($model): void
    {
        $this->logActivity('updated', $model);
    }

    /**
     * Handle the "deleted" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function deleted($model): void
    {
        $this->logActivity('deleted', $model);
    }

    /**
     * Record the activity to system_logs.
     *
     * @param string $action
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    protected function logActivity(string $action, $model): void
    {
        SystemLog::create([
            'user_id' => Auth::id(),
            'loggable_type' => get_class($model),
            'loggable_id' => $model->id,
            'action' => $action,
            'description' => class_basename($model) . " has been {$action}.",
            'changes' => $action === 'updated' ? $model->getChanges() : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
