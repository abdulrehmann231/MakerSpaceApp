'use client'

export default function ThemeController() {
  return (
    <div>
      <button className="theme btn btn-info sq-btn rounded float-bottom-right" data-toggle="modal" data-target="#colorscheme">
        <i className="material-icons">color_lens</i>
      </button>
      <div className="modal fade" id="colorscheme" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-bottom theme-header">
              <p className="text-uppercase font-weight-bold text-white my-2">Choose your color</p>
              <button type="button" className="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center theme-color">
                <p className="text-uppercase font-weight-bold text-dark text-center">Select Color</p>
                <button className="m-2 btn btn-danger rounded sq-btn text-white" data-theme="color-theme-red">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-primary rounded sq-btn text-white" data-theme="color-theme-blue">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-warning rounded sq-btn text-white" data-theme="color-theme-yellow">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-success rounded sq-btn text-white" data-theme="color-theme-green">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <br />
                <button className="m-2 btn btn-pink rounded sq-btn text-white" data-theme="color-theme-pink">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-orange rounded sq-btn text-white" data-theme="color-theme-orange">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-gray rounded sq-btn text-white" data-theme="color-theme-gray">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
                <button className="m-2 btn btn-black rounded sq-btn text-white" data-theme="color-theme-black">
                  <i className="material-icons w-25px">color_lens_outline</i>
                </button>
              </div>
              <hr className="mt-4" />
              <div className="row align-items-center mt-4">
                <div className="col-12 w-100">
                  <p className="text-uppercase font-weight-bold text-dark text-center">Layout Mode</p>
                </div>
                <div className="col text-right">
                  <i className="material-icons text-warning icon-3x">wb_sunny</i>
                </div>
                <div className="col-auto text-center">
                  <input type="checkbox" id="theme-dark" className="switch" />
                  <label htmlFor="theme-dark">Toggle</label>
                </div>
                <div className="col text-left">
                  <i className="material-icons text-dark icon-3x">brightness_2</i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
