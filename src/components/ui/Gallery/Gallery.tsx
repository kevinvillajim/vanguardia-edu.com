const Gallery = ({ imgSrc, altText, title }) => {
  return (
    <article className="card">
      <figure className="">
        <img
          src={imgSrc}
          alt={altText}
        />
        <figcaption>
          <h3>{title}</h3>
        </figcaption>
      </figure>
    </article>
  );
};

export default Gallery;
