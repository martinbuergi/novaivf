export async function getIndex(index, indexUrl) {
  window.pageIndex = window.pageIndex || {};
  if (!window.pageIndex[index]) {
    const resp = await fetch(indexUrl);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.error('loading index', resp);
      return []; // do not cache in case of error
    }
    const json = await resp.json();
    window.pageIndex[index] = json.data;
  }
  return window.pageIndex[index];
}

async function getAuthorPath(index, name) {
  const author = index.find((element) => element.author === name);
  if (!author?.author) {
    return '';
  }
  return author.path;
}

async function getContactHtml(path) {
  const response = await fetch(`${path}.plain.html`);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading contact details', response);
    return '';
  }
  const text = await response.text();
  return text;
}

export default async function decorate(block) {
  const authorDiv = block.querySelector(':scope > div');
  const authorName = authorDiv.firstElementChild.outerText.trim();
  const span = document.createElement('SPAN');
  const spanAuthor = document.createElement('SPAN');
  const imgContainer = document.createElement('DIV');

  if (authorName.length === 0) return;

  const index = await getIndex('author', '/authors/query-index.json');
  const authorPath = await getAuthorPath(index, authorName);
  if (!authorPath) return;

  const employeeContactHtml = await getContactHtml(authorPath);

  span.className = 'author-tag';
  span.innerHTML = 'AUTHOR';

  spanAuthor.className = 'author-info';

  const element = document.createElement('div');
  element.innerHTML = employeeContactHtml;

  imgContainer.className = 'author-img-container';

  const spanAuthorName = element.querySelector('h2');
  if (spanAuthorName) {
    spanAuthorName.className = 'author-name';
    spanAuthor.appendChild(spanAuthorName);
  }

  const spanAuthorDesc = document.createElement('SPAN');
  spanAuthorDesc.className = 'author-description';

  const description = element.querySelectorAll('p')[1];
  if (description) {
    spanAuthorDesc.appendChild(description);
    spanAuthor.appendChild(spanAuthorDesc);
  }

  const picture = element.querySelector('PICTURE');
  if (picture) {
    picture.className = 'author-img';
    imgContainer.appendChild(picture);
    imgContainer.appendChild(spanAuthor);
  }

  authorDiv.firstElementChild.remove();
  authorDiv.appendChild(span);
  authorDiv.appendChild(imgContainer);
}
