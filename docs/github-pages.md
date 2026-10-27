# Публикация через GitHub Pages

## Текущее состояние

В папке проекта нет .git: локальный Git-репозиторий не инициализирован, remote не подключён. Существование отдельного репозитория на GitHub без его URL установить нельзя. Во время подготовки Git-репозиторий не создавался, commit/push и публикация не выполнялись.

## Настройки

vite.config.js получает имя репозитория из переменной GITHUB_REPOSITORY, которую GitHub Actions предоставляет автоматически. Для обычного репозитория base = /ИМЯ-РЕПОЗИТОРИЯ/. Для репозитория USERNAME.github.io base = /. Локально без переменной используется относительный base ./.

При необходимости своего домена можно передать PAGES_BASE_PATH=/ в шаг сборки workflow. Для стандартного GitHub Pages это не требуется.

Vite переписывает пути HTML и CSS при сборке. Динамически создаваемые изображения второй и третьей секций используют import.meta.env.BASE_URL. Шрифты, текстура зерна и favicon включаются с тем же base. Имена исходных файлов, включая пробелы и двойное расширение существующего PNG, сохранены.

.github/workflows/deploy.yml запускается после push в main или вручную через Actions. Node 24, npm ci, сборка dist, загрузка Pages artifact и deploy. В dist не требуется коммитить файлы. node_modules, dist и .DS_Store уже исключены через .gitignore.

## Порядок публикации — выполнять только после подтверждения

1. На GitHub создать пустой публичный репозиторий с выбранным именем (например, life-by-blueprint), без начального README/.gitignore/license. Если репозиторий уже есть, использовать его URL и проверить отсутствие конфликтующей истории перед первым push.
2. В терминале открыть корневую папку этого проекта. Для нового пустого репозитория:

```sh
git init -b main
git add .
git status
git commit -m "Prepare longread for GitHub Pages"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
```

Заменить USERNAME и REPOSITORY реальными значениями. Если удалённый репозиторий уже содержит коммиты, не использовать force push: сначала согласовать истории.

3. В GitHub открыть Settings → Pages → Build and deployment → Source и выбрать GitHub Actions.
4. После подтверждения публикации выполнить:

```sh
git push -u origin main
```

5. На вкладке Actions дождаться успешных jobs build и deploy. Сайт появится по адресу из environment github-pages: обычно https://USERNAME.github.io/REPOSITORY/.
6. Если первый запуск произошёл до включения Pages, после выбора GitHub Actions повторить workflow через Run workflow / Re-run jobs.
7. Проверить опубликованный адрес, изображения и favicon, прокрутку и ссылки. Последующие push в main будут автоматически обновлять сайт.

## Локальная проверка

```sh
npm ci
npm run build
npm run preview
```

Для имитации подпапки GitHub Pages:

```sh
GITHUB_REPOSITORY=preview-owner/life-by-blueprint npm run build
GITHUB_REPOSITORY=preview-owner/life-by-blueprint npm run preview -- --host 127.0.0.1 --port 4173
```

Открыть http://127.0.0.1:4173/life-by-blueprint/. Preview предназначен для локальной проверки production-сборки.

## Выполненные проверки

- Обычная production-сборка и сборка с /life-by-blueprint/ прошли.
- Все 25 локальных ссылок HTML/CSS в dist указывают на существующие файлы; лишних корневых путей не осталось.
- Все 38 записей динамических изображений второй и третьей секций существуют.
- В production-браузере загрузились все 55 изображений; document.fonts.status = loaded, четыре секции имеют status ready, создано пять pin-spacer.
- Favicon в браузере имеет адрес /life-by-blueprint/favicon.svg.
- Проверены реакция сцены на прокрутку, конечное состояние и обратное движение финальной ленты: x меняется с -2560 на -2327.5 px при прокрутке назад.
- В консоли нет ошибок JavaScript.
- Три внешние ссылки footer сохранили URL, target=_blank и rel=noopener noreferrer. Внешняя доступность ресурсов назначения зависит от их владельцев; в этом проходе повторный вход в сторонние сервисы не выполнялся.
- Первоначальные изображения, тексты, стили и параметры анимации не изменялись; поправлены только пути динамических ресурсов.
- Workflow подготовлен по официальной инструкции Vite: https://vite.dev/guide/static-deploy#github-pages. Фактический запуск Actions и опубликованный адрес можно проверить после подключения репозитория и разрешённого push.
