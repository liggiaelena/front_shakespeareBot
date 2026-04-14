import './header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header__top-rule" />
      <div className="header__ornament">❧ &nbsp; ✦ &nbsp; ❧</div>
      <div className="header__title-group">
        <h1 className="header__title">The Globe Theatre</h1>
        <p className="header__subtitle">Converse with William Shakespeare</p>
      </div>
      <div className="header__ornament">❧ &nbsp; ✦ &nbsp; ❧</div>
      <div className="header__bottom-rule" />
    </header>
  )
}
