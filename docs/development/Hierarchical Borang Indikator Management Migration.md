## Hierarchical Borang Indikator Management - Migration Documentation

### Overview
This document describes the successful implementation and testing of the hierarchical evaluation structure for the Jurnal MU accreditation system. The migration introduces a four-level hierarchy: Templates → Categories → Sub-Categories → Indicators, with support for essay questions.

### Migration Summary
Five migration files were created and tested to implement the hierarchical structure while maintaining backward compatibility with the existing v1.0 system.

---

### Migration Files

#### 1. `2026_01_27_100000_create_accreditation_templates_table.php`
**Purpose**: Creates the top-level template structure for accreditation and indexation types.

**Features**:
- ENUM type field supporting 'akreditasi' and 'indeksasi'
- Soft deletes for data retention
- Proper indexing for performance
- Simple rollback strategy using `dropIfExists()`

**Execution Time**: 170ms

---

#### 2. `2026_01_27_110000_create_evaluation_categories_table.php`
**Purpose**: Creates Level 1 hierarchy (Unsur Evaluasi) linked to templates.

**Features**:
- Foreign key to `accreditation_templates` with CASCADE DELETE
- Unique constraint on `code` per template
- Weight management (0-100) for scoring
- Proper FK cleanup in rollback (drop FK first, then table)

**Execution Time**: 119ms

---

#### 3. `2026_01_27_120000_create_evaluation_sub_categories_table.php`
**Purpose**: Creates Level 2 hierarchy (Sub-Unsur) linked to categories.

**Features**:
- Foreign key to `evaluation_categories` with CASCADE DELETE
- Unique constraint on `code` per category
- Hierarchical weight inheritance
- Safe rollback with FK removal before table drop

**Execution Time**: 103ms

---

#### 4. `2026_01_27_130000_create_essay_questions_table.php`
**Purpose**: Creates essay question structure linked directly to categories (not sub-categories).

**Features**:
- Fields: `question`, `guidance`, `max_words`, `is_required`
- Foreign key to `evaluation_categories` with CASCADE DELETE
- Flexible attachment to category level
- Proper FK cleanup in rollback

**Execution Time**: 99ms

---

#### 5. `2026_01_27_140000_alter_evaluation_indicators_add_hierarchy.php`
**Purpose**: Updates existing indicators table to support new hierarchy while maintaining backward compatibility.

**Features**:
- Adds nullable `sub_category_id` column
- Marks legacy `category` and `sub_category` columns as DEPRECATED
- Foreign key to `evaluation_sub_categories` with CASCADE DELETE
- Complete rollback: FK → Index → Column → Comment reversion

**Execution Time**: 140ms

---

### Testing Results

#### ✅ Test 1: Migration Execution
- All 5 migrations executed successfully in sequence
- Batches: 3-7
- Total execution time: ~632ms
- No errors or warnings

#### ✅ Test 2: Rollback Testing
- Command: `php artisan migrate:rollback --step=5`
- Result: All migrations rolled back successfully
- Status changed from [Ran] to [Pending]
- Clean database state restored

#### ✅ Test 3: Backward Compatibility
- Command: `php artisan tinker --execute="echo \App\Models\EvaluationIndicator::count();"`
- Result: 12 indicators accessible after rollback
- v1.0 data integrity maintained
- No data loss during migration/rollback cycle

#### ✅ Test 4: Idempotency Testing
- Re-ran all 5 migrations after rollback
- Result: All migrations executed without errors
- Tables recreated with identical schema
- Demonstrates safe re-deployment capability

#### ✅ Test 5: Schema Verification
- ✓ `accreditation_templates` table exists
- ✓ `evaluation_categories` table exists
- ✓ `evaluation_sub_categories` table exists
- ✓ `essay_questions` table exists
- ✓ `evaluation_indicators.sub_category_id` column exists

---

### Database Structure

accreditation_templates (NEW)
    ├── evaluation_categories (NEW)
    │   ├── evaluation_sub_categories (NEW)
    │   │   └── evaluation_indicators (UPDATED: + sub_category_id)
    │   └── essay_questions (NEW)

#### Total Tables Created: 4 new + 1 altered
#### Total Time: ~632ms for all migrations
#### Rollback Time: ~instant (< 1 second)

