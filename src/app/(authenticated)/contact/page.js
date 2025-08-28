'use client'

export default function ContactPage() {
  return (
    <div className="no-top-gap">
      <div className="row mx-0 mt-3">
        <div className="col">
          <h2 className="block-title">Makerspace Delft</h2>
          <div className="row mx-0">
            <div className="col">
              <p>
                Makerspace Delft <br />
                Schieweg 15D<br />2627 AN Delft, Netherlands
              </p>
            </div>
          </div>
          <a href="https://discord.com/invite/qHVbghbW" target="_blank" className="btn btn-block btn-outline-secondary rounded">Discord</a>
          <a href="mailto:contact@makerspacedelft.nl" target="_blank" className="btn btn-block btn-outline-secondary rounded">Email</a>
        </div>
      </div>
    </div>
  )
}
