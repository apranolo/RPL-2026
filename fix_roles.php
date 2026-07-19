<?php
function replace_in_file($path, $search, $replace) {
    if (!file_exists($path)) return;
    $content = file_get_contents($path);
    $new_content = str_replace($search, $replace, $content);
    if ($content !== $new_content) {
        file_put_contents($path, $new_content);
        echo "Updated $path\n";
    }
}

replace_in_file('tests/Feature/Admin/OutputReportTest.php', 
    "Role::firstOrCreate(['id' => Role::SUPER_ADMIN, 'name' => 'super_admin']);", 
    "Role::firstOrCreate(['id' => Role::SUPER_ADMIN, 'name' => 'super_admin', 'display_name' => 'Super Admin']);");

replace_in_file('tests/Feature/Admin/OutputReportTest.php', 
    "Role::firstOrCreate(['id' => Role::ADMIN_KAMPUS, 'name' => 'admin_kampus']);", 
    "Role::firstOrCreate(['id' => Role::ADMIN_KAMPUS, 'name' => 'admin_kampus', 'display_name' => 'Admin Kampus']);");

replace_in_file('tests/Feature/Admin/OutputReportTest.php', 
    "Role::firstOrCreate(['id' => Role::USER, 'name' => 'user']);", 
    "Role::firstOrCreate(['id' => Role::USER, 'name' => 'user', 'display_name' => 'User']);");

replace_in_file('tests/Feature/EditorialShowTest.php', 
    "Role::firstOrCreate(['name' => 'Editor']);", 
    "Role::firstOrCreate(['name' => 'Editor', 'display_name' => 'Editor']);");

replace_in_file('tests/Feature/Editorial/ShowDetailTest.php', 
    "Role::firstOrCreate(['name' => 'Editor']);", 
    "Role::firstOrCreate(['name' => 'Editor', 'display_name' => 'Editor']);");

replace_in_file('tests/Feature/RevisionCopyeditingTest.php', 
    "Role::firstOrCreate(['id' => 3, 'name' => 'Pengelola Jurnal']);", 
    "Role::firstOrCreate(['id' => 3, 'name' => 'Pengelola Jurnal', 'display_name' => 'Pengelola Jurnal']);");

