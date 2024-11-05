import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'Welcome To Afriqana',
  description: 'Dine-in or Order online',
  keywords: 'Best west-African styled Resturant in Europe',
};

export default Meta;