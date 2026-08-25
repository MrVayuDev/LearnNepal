# PowerShell script to aggregate all questions from JSON files into question-bank/index.html

$computerPath = "data\question-bank\computer.json"
$englishPath  = "data\question-bank\english.json"
$nepaliPath   = "data\question-bank\nepali.json"
$indexPath    = "pages\class-12\question-bank\index.html"

$allArticles = ""

# 1. Process Computer Science
if (Test-Path $computerPath) {
    $d = Get-Content -Path $computerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($ch in $d.chapters) {
        foreach ($q in $ch.questions) {
            $subj = "Computer Science"
            $year = if ($q.year) { $q.year } else { "2081" }
            $qType = if ($q.questionType) { $q.questionType.ToLower() } else { "short" }
            $marks = if ($q.marks) { "$($q.marks) Marks" } else { "" }
            $qText = $q.questionText
            $answer = $q.answer
            
            $typeLabel = if ($qType -eq 'mcq') { "MCQ" } elseif ($qType -eq 'long') { "Long Answer" } else { "Short Answer" }
            $tagColor = "bg-primary/10 text-primary"

            $allArticles += @"
<article class="qb-question-card bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/30 card-lift group" data-subject="$subj" data-year="$year" data-type="$qType">
<div class="flex justify-between items-start mb-4">
<div class="flex gap-2 mb-2">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold $tagColor">$subj</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">$year</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">$typeLabel</span>
</div>
<span class="font-headline-sm text-primary">$marks</span>
</div>
<h3 class="font-headline-sm text-on-surface mb-4" style="white-space: pre-line;">$qText</h3>
<div class="solution-box hidden mt-4 p-4 rounded-xl bg-surface-container-low text-body-md text-on-surface border border-outline-variant">
<p class="font-bold mb-2 text-primary">Solution:</p>
<div>$answer</div>
</div>
<div class="flex items-center justify-between mt-6 pt-4 border-t border-surface-variant/50">
<a href="computer/index.html" class="text-xs text-primary hover:underline font-label-md flex items-center gap-1">Open CS QBank &rarr;</a>
<button onclick="toggleSolution(this)" class="toggle-sol-btn btn-primary py-2 px-4 text-sm flex items-center gap-1">
<span>View Solution</span>
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
</article>

"@
        }
    }
}

# 2. Process English
if (Test-Path $englishPath) {
    $d = Get-Content -Path $englishPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($sec in $d.sections) {
        foreach ($q in $sec.questions) {
            $subj = "English"
            $year = if ($q.year) { $q.year } else { "2083" }
            $qType = if ($q.questionType) { $q.questionType.ToLower() } else { "short" }
            $marks = if ($q.marks) { "$($q.marks) Marks" } else { "" }
            $qText = $q.questionText
            $answer = $q.answer
            
            $typeLabel = if ($qType -eq 'mcq') { "MCQ" } elseif ($qType -eq 'long') { "Long Answer" } else { "Short Answer" }
            $tagColor = "bg-secondary/10 text-secondary"

            $allArticles += @"
<article class="qb-question-card bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/30 card-lift group" data-subject="$subj" data-year="$year" data-type="$qType">
<div class="flex justify-between items-start mb-4">
<div class="flex gap-2 mb-2">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold $tagColor">$subj</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">$year</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">$typeLabel</span>
</div>
<span class="font-headline-sm text-primary">$marks</span>
</div>
<h3 class="font-headline-sm text-on-surface mb-4" style="white-space: pre-line;">$qText</h3>
<div class="solution-box hidden mt-4 p-4 rounded-xl bg-surface-container-low text-body-md text-on-surface border border-outline-variant">
<p class="font-bold mb-2 text-primary">Solution:</p>
<div>$answer</div>
</div>
<div class="flex items-center justify-between mt-6 pt-4 border-t border-surface-variant/50">
<a href="english/index.html" class="text-xs text-secondary hover:underline font-label-md flex items-center gap-1">Open English QBank &rarr;</a>
<button onclick="toggleSolution(this)" class="toggle-sol-btn btn-primary py-2 px-4 text-sm flex items-center gap-1">
<span>View Solution</span>
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
</article>

"@
        }
    }
}

# 3. Process Nepali
if (Test-Path $nepaliPath) {
    $d = Get-Content -Path $nepaliPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $sectionsOrChapters = if ($d.sections) { $d.sections } else { $d.chapters }
    foreach ($sec in $sectionsOrChapters) {
        foreach ($q in $sec.questions) {
            $subj = "Nepali"
            $year = if ($q.year) { $q.year } else { "2081" }
            $qType = if ($q.questionType) { $q.questionType.ToLower() } else { "long" }
            $marks = if ($q.marks) { "$($q.marks) Marks" } else { "" }
            $qText = $q.questionText
            $answer = $q.answer
            
            $typeLabel = if ($qType -eq 'mcq') { "MCQ" } elseif ($qType -eq 'long') { "Long Answer" } else { "Short Answer" }
            $tagColor = "bg-tertiary/10 text-tertiary"

            $allArticles += @"
<article class="qb-question-card bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/30 card-lift group" data-subject="$subj" data-year="$year" data-type="$qType">
<div class="flex justify-between items-start mb-4">
<div class="flex gap-2 mb-2">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold $tagColor">$subj</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">$year</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">$typeLabel</span>
</div>
<span class="font-headline-sm text-primary">$marks</span>
</div>
<h3 class="font-headline-sm text-on-surface mb-4" style="white-space: pre-line;">$qText</h3>
<div class="solution-box hidden mt-4 p-4 rounded-xl bg-surface-container-low text-body-md text-on-surface border border-outline-variant">
<p class="font-bold mb-2 text-primary">समाधान:</p>
<div>$answer</div>
</div>
<div class="flex items-center justify-between mt-6 pt-4 border-t border-surface-variant/50">
<a href="nepali/index.html" class="text-xs text-tertiary hover:underline font-label-md flex items-center gap-1">Open Nepali QBank &rarr;</a>
<button onclick="toggleSolution(this)" class="toggle-sol-btn btn-primary py-2 px-4 text-sm flex items-center gap-1">
<span>View Solution</span>
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</div>
</article>

"@
        }
    }
}

# Update index.html
$indexContent = Get-Content -Path $indexPath -Raw -Encoding UTF8
$indexContent = [regex]::Replace($indexContent, '(?s)<div id="questions-container" class="space-y-6">.*?</div>\s*<!-- Filter Script -->', '<div id="questions-container" class="space-y-6">' + "`n" + $allArticles + '</div>' + "`n`n<!-- Filter Script -->")

Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8
Write-Output "Successfully populated all questions into $indexPath"
