const IPFS = require('ipfs-api');
const Fiber = require('fibers');
const Future = require('fibers/future');
const fiberUtils = require('fiber-utils');
const FiberUtils = new fiberUtils.FiberUtils(Fiber, Future);

const ipfs = new IPFS();

ipfs.object.getSync = FiberUtils.wrap(ipfs.object.get);
ipfs.object.putSync = FiberUtils.wrap(ipfs.object.put);
ipfs.object.statSync = FiberUtils.wrap(ipfs.object.stat);
ipfs.pin.addSync = FiberUtils.wrap(ipfs.pin.add);
ipfs.pin.rmSync = FiberUtils.wrap(ipfs.pin.rm);

FiberUtils.ensure(() => {
  const blocks = [];
  let parent = null;
  let size = 0;
  for (let i = 0; i < 10000; i++) {
    let block = {
      Data: JSON.stringify({
        Time: new Date(),
        Length: i
      }),
      Links: []
    };

    if (parent) {
      block.Links.push({
        Name: "parent",
        Hash: parent,
        Size: size
      });
    }

    let node = ipfs.object.putSync(block).toJSON();
    parent = node.multihash;
    size = node.size;

    blocks.push(parent);

    console.log(`Added ${parent}, size ${size}, count ${i}.`);
  }

  for (let i = 0; i < blocks.length; i += 5000) {
    ipfs.pin.addSync(blocks.slice(i, i + 5000), {recursive: false});
  }
});
