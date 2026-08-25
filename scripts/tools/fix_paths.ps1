$filesDepth2 = @(
    'pages\class-11\english.html',
    'pages\class-11\nepali.html',
    'pages\class-12\nepali.html'
)

$filesDepth3 = @(
    'pages\class-10\opt-math\index.html',
    'pages\class-11\computer\c11_computer_syllabus.html',
    'pages\class-12\computer\c12_computer_syllabus.html',
    'pages\class-12\english\c12_english_syllabus.html',
    'pages\class-11\computer\c11_computer_chapter_1.html',
    'pages\class-11\computer\c11_computer_chapter_2.html',
    'pages\class-12\computer\c12_computer_chapter_1.html',
    'pages\class-12\computer\c12_computer_chapter_2.html',
    'pages\class-12\english\c12_english_unit_1.html',
    'pages\class-12\english\c12_english_story_1.html',
    'pages\class-12\english\c12_english_2083_solutions.html',
    'pages\class-12\nepali\c12_nepali_chapter_1.html',
    'pages\class-12\nepali\c12_nepali_chapter_9.html'
)

foreach ($file in $filesDepth2) {
    $path = Join-Path 'c:\Users\Om Raut\Documents\GitHub\LearnNepal' $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        $content = $content -replace '(?<!\.)\.\./scripts/search\.js', '../../scripts/search.js'
        $content = $content -replace '(?<!\.)\.\./scripts/transitions\.js', '../../scripts/transitions.js'
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed depth 2: $file"
    }
}

foreach ($file in $filesDepth3) {
    $path = Join-Path 'c:\Users\Om Raut\Documents\GitHub\LearnNepal' $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        $content = $content -replace '(?<!\.)\.\./scripts/search\.js', '../../../scripts/search.js'
        $content = $content -replace '(?<!\.)\.\./scripts/transitions\.js', '../../../scripts/transitions.js'
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed depth 3: $file"
    }
}
