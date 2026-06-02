/**
 * UI Controller — Sidebar Accordion Builder
 * 
 * Dynamically generates the chapter/exercise navigation tree
 * from the curriculum schema using <details>/<summary> elements.
 * Matches the main LearnNepal design system.
 */
export function buildSyllabusMenu(courseData, targetNode, onSelectionCallback, options = {}) {
  targetNode.innerHTML = '';

  const { initialChapter, initialExercise } = options;
  let autoTriggered = false;

  courseData.chapters.forEach(chapter => {
    const detailNode = document.createElement('details');
    detailNode.className = 'viewer-chapter-group';
    detailNode.id = `group-${chapter.id}`;

    // Auto-open the chapter that matches the URL param
    if (initialChapter && chapter.id === initialChapter) {
      detailNode.open = true;
    }

    const summaryNode = document.createElement('summary');
    summaryNode.className = 'viewer-chapter-summary';
    summaryNode.innerHTML = `
      <span>${chapter.title}</span>
      <svg class="viewer-chapter-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    `;

    const exerciseGroup = document.createElement('div');
    exerciseGroup.className = 'viewer-exercise-list';

    chapter.exercises.forEach(ex => {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'viewer-exercise-btn';
      actionBtn.id = `trigger-${ex.id}`;
      actionBtn.innerText = ex.name;

      actionBtn.addEventListener('click', () => {
        // Clear all active states
        document.querySelectorAll('.viewer-exercise-btn').forEach(n => n.classList.remove('is-active'));
        document.querySelectorAll('.viewer-chapter-group').forEach(g => g.classList.remove('has-active'));

        actionBtn.classList.add('is-active');
        detailNode.classList.add('has-active');

        onSelectionCallback({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          exerciseId: ex.id,
          exerciseName: ex.name,
          pdfUrl: ex.file
        });
      });

      // Auto-trigger the initial exercise from URL params
      if (!autoTriggered && initialChapter === chapter.id && initialExercise === ex.id) {
        autoTriggered = true;
        // Delay slightly so the DOM is ready
        requestAnimationFrame(() => {
          actionBtn.click();
        });
      }

      exerciseGroup.appendChild(actionBtn);
    });

    detailNode.appendChild(summaryNode);
    detailNode.appendChild(exerciseGroup);
    targetNode.appendChild(detailNode);
  });

  // If we had URL params but the exercise wasn't found, auto-open the first exercise of the chapter
  if (!autoTriggered && initialChapter) {
    const targetGroup = document.getElementById(`group-${initialChapter}`);
    if (targetGroup) {
      targetGroup.open = true;
      const firstBtn = targetGroup.querySelector('.viewer-exercise-btn');
      if (firstBtn) {
        requestAnimationFrame(() => firstBtn.click());
      }
    }
  }
}
