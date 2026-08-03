import re

def process_file(src, dst, depth_str):
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add theme.js to head
    head_end = content.find('</head>')
    if head_end != -1:
        theme_script = f'<script src="{depth_str}scripts/theme.js"></script>\n'
        content = content[:head_end] + theme_script + content[head_end:]
        
    # 2. Fix navigation links
    # Home
    content = re.sub(r'href="#"([^>]*>Home<)', rf'href="{depth_str}index.html"\1', content)
    # Courses
    content = re.sub(r'href="#"([^>]*>Courses<)', rf'href="{depth_str}pages/courses.html"\1', content)
    # Question Bank
    content = re.sub(r'href="#"([^>]*>Question Bank<)', rf'href="{depth_str}pages/class-12/question-bank/index.html"\1', content)
    # About
    content = re.sub(r'href="#"([^>]*>About<)', rf'href="{depth_str}about.html"\1', content)
    # LearnNepal Logo (some have line breaks)
    content = re.sub(r'href="#"([^>]*>\s*LearnNepal\s*<)', rf'href="{depth_str}index.html"\1', content)
    
    # 3. Add theme-toggle class
    # contact page dark mode span
    content = content.replace('class="material-symbols-outlined text-on-surface-variant cursor-pointer"', 'class="material-symbols-outlined text-on-surface-variant cursor-pointer theme-toggle"')
    # courses page dark mode button
    content = content.replace('class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"', 'class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors theme-toggle"')
    # neb page dark mode button
    content = content.replace('class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"', 'class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container theme-toggle"')
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('example/contact_us_learnnepal/code.html', 'contact.html', './')
process_file('example/courses_learnnepal/code.html', 'pages/courses.html', '../')
process_file('example/neb_question_bank/code.html', 'pages/class-12/question-bank/index.html', '../../../')
print('Done!')
